import { NextResponse } from "next/server";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { accounts, plaidItems, syncCursors, transactions } from "@/db/schema";
import { plaidClient } from "@/lib/plaid";
import { createClient } from "@/lib/supabase/server";

// Maximum rows per INSERT to avoid query payload limits on large initial syncs
const BATCH_SIZE = 500;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SyncResult {
  plaidItemId: string;
  institutionName: string | null;
  added: number;
  modified: number;
  removed: number;
}

interface SyncError {
  plaidItemId: string;
  institutionName: string | null;
  error: string;
}

type PlaidItem = typeof plaidItems.$inferSelect;

// ---------------------------------------------------------------------------
// Per-item sync — throws on failure so Promise.allSettled can capture it
// ---------------------------------------------------------------------------

async function syncItem(item: PlaidItem, userId: string): Promise<SyncResult> {
  // ── Step 1: Load the stored cursor ───────────────────────────────────────
  // An absent row or an empty-string cursor both mean "no prior sync" —
  // omitting the cursor in the Plaid call triggers a full initial sync.
  const [cursorRow] = await db
    .select({ cursor: syncCursors.cursor })
    .from(syncCursors)
    .where(eq(syncCursors.plaidItemId, item.id));

  const initialCursor = cursorRow?.cursor || undefined;

  // ── Step 2: Paginate transactionsSync until has_more === false ────────────
  // Collect everything before touching the DB so that a mid-pagination failure
  // leaves the cursor unchanged (next run retries from the same point).
  const allAdded: any[] = [];
  const allModified: any[] = [];
  const allRemoved: any[] = [];
  let latestAccounts: any[] = []; // overwritten each page — last page is most current
  let paginationCursor = initialCursor;
  let nextCursor = "";
  let hasMore = true;

  while (hasMore) {
    const { data } = await plaidClient.transactionsSync({
      access_token: item.accessToken,
      // Omit cursor entirely on first sync — passing undefined would be ignored
      // but being explicit avoids any SDK edge-case behaviour
      ...(paginationCursor ? { cursor: paginationCursor } : {}),
    });

    allAdded.push(...data.added);
    allModified.push(...data.modified);
    allRemoved.push(...data.removed);
    latestAccounts = data.accounts;
    nextCursor = data.next_cursor;
    hasMore = data.has_more;
    // Advance the cursor for the next pagination call (not saved to DB yet)
    paginationCursor = data.next_cursor;
  }

  // ── Step 3: Upsert accounts ───────────────────────────────────────────────
  // transactionsSync returns the full account list on every page; we use the
  // final page because it reflects the most recently settled balances.
  if (latestAccounts.length > 0) {
    const accountValues = latestAccounts.map((a: any) => ({
      plaidItemId: item.id,
      userId,
      plaidAccountId: a.account_id as string,
      name: a.name as string,
      officialName: (a.official_name as string | null) ?? null,
      type: String(a.type),
      subtype: a.subtype ? String(a.subtype) : null,
      mask: (a.mask as string | null) ?? null,
      currentBalance:
        a.balances.current != null
          ? (a.balances.current as number).toFixed(2)
          : null,
      availableBalance:
        a.balances.available != null
          ? (a.balances.available as number).toFixed(2)
          : null,
      isoCurrencyCode: (a.balances.iso_currency_code as string | null) ?? null,
      updatedAt: new Date(),
    }));

    await db
      .insert(accounts)
      .values(accountValues)
      .onConflictDoUpdate({
        target: accounts.plaidAccountId,
        set: {
          name: sql`excluded.name`,
          officialName: sql`excluded.official_name`,
          type: sql`excluded.type`,
          subtype: sql`excluded.subtype`,
          mask: sql`excluded.mask`,
          currentBalance: sql`excluded.current_balance`,
          availableBalance: sql`excluded.available_balance`,
          isoCurrencyCode: sql`excluded.iso_currency_code`,
          updatedAt: new Date(),
        },
      });
  }

  // Build plaid_account_id → local accounts.id map needed to satisfy the FK
  // on transactions.account_id. Query after upsert so we have all rows for
  // this item (including any that were already there from a prior sync).
  const accountRows = await db
    .select({ id: accounts.id, plaidAccountId: accounts.plaidAccountId })
    .from(accounts)
    .where(eq(accounts.plaidItemId, item.id));

  const accountLookup = new Map(
    accountRows.map((a) => [a.plaidAccountId, a.id])
  );

  // ── Step 4: Upsert added + modified transactions ──────────────────────────
  // Treating added and modified identically is correct: Plaid's ON CONFLICT
  // semantics mean an "added" transaction on retry (after a crash before
  // cursor save) will simply update an existing row.
  const toUpsert = [...allAdded, ...allModified];

  if (toUpsert.length > 0) {
    const txnValues = toUpsert
      .map((t: any) => {
        const accountId = accountLookup.get(t.account_id as string);
        if (!accountId) {
          // Should not happen: Plaid guarantees every transaction belongs to
          // one of the returned accounts. Skip defensively to avoid a FK error.
          console.warn(
            `[sync] No local account for plaid_account_id="${t.account_id}"` +
              ` (transaction "${t.transaction_id}") — skipping`
          );
          return null;
        }
        return {
          plaidTransactionId: t.transaction_id as string,
          accountId,
          plaidItemId: item.id,
          userId,
          name: t.name as string,
          merchantName: (t.merchant_name as string | null) ?? null,
          // Plaid amounts are JS floats; toFixed(2) gives exact string for numeric(14,2)
          amount: (t.amount as number).toFixed(2),
          date: t.date as string,
          authorizedDate: (t.authorized_date as string | null) ?? null,
          pending: (t.pending as boolean) ?? false,
          paymentChannel: (t.payment_channel as string | null) ?? null,
          categoryPrimary: t.personal_finance_category?.primary ?? null,
          categoryDetailed: t.personal_finance_category?.detailed ?? null,
          logoUrl: (t.logo_url as string | null) ?? null,
          // Denormalized so queries never need to join back to plaid_items
          institutionName: item.institutionName,
          updatedAt: new Date(),
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    for (let i = 0; i < txnValues.length; i += BATCH_SIZE) {
      await db
        .insert(transactions)
        .values(txnValues.slice(i, i + BATCH_SIZE))
        .onConflictDoUpdate({
          target: transactions.plaidTransactionId,
          set: {
            name: sql`excluded.name`,
            merchantName: sql`excluded.merchant_name`,
            amount: sql`excluded.amount`,
            date: sql`excluded.date`,
            authorizedDate: sql`excluded.authorized_date`,
            pending: sql`excluded.pending`,
            paymentChannel: sql`excluded.payment_channel`,
            categoryPrimary: sql`excluded.category_primary`,
            categoryDetailed: sql`excluded.category_detailed`,
            logoUrl: sql`excluded.logo_url`,
            updatedAt: new Date(),
          },
        });
    }
  }

  // ── Step 5: Delete removed transactions ───────────────────────────────────
  // If a removed ID is not in our DB (e.g. a pending tx we never stored),
  // the DELETE WHERE IN is a safe no-op.
  if (allRemoved.length > 0) {
    const removedIds = allRemoved.map((r: any) => r.transaction_id as string);
    await db
      .delete(transactions)
      .where(inArray(transactions.plaidTransactionId, removedIds));
  }

  // ── Step 6: Persist cursor — MUST be last ────────────────────────────────
  // Only save after every DB write above has succeeded.  If anything above
  // throws, the cursor is NOT updated, so the next run retries from the last
  // known-good point.  An empty nextCursor means Plaid has no data yet; skip
  // persisting so the next call triggers a fresh initial sync.
  if (nextCursor) {
    await db
      .insert(syncCursors)
      .values({
        plaidItemId: item.id,
        userId,
        cursor: nextCursor,
        lastSyncedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: syncCursors.plaidItemId,
        set: {
          cursor: nextCursor,
          lastSyncedAt: new Date(),
        },
      });
  }

  return {
    plaidItemId: item.id,
    institutionName: item.institutionName,
    added: allAdded.length,
    modified: allModified.length,
    removed: allRemoved.length,
  };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Optional single-item filter ───────────────────────────────────────────
  // If plaidItemId is provided, sync only that item (e.g. right after
  // exchange-public-token).  If omitted, sync all items for the user.
  const body = await request.json().catch(() => ({}));
  const plaidItemId: string | undefined =
    typeof body?.plaidItemId === "string" ? body.plaidItemId : undefined;

  // ── Load items ────────────────────────────────────────────────────────────
  const items = await db
    .select()
    .from(plaidItems)
    .where(
      plaidItemId
        ? and(eq(plaidItems.id, plaidItemId), eq(plaidItems.userId, user.id))
        : eq(plaidItems.userId, user.id)
    );

  if (items.length === 0) {
    return NextResponse.json({ synced: [], errors: [] });
  }

  // ── Sync all items in parallel; one failure never blocks the others ───────
  const settled = await Promise.allSettled(
    items.map((item) => syncItem(item, user.id))
  );

  const synced: SyncResult[] = [];
  const errors: SyncError[] = [];

  settled.forEach((result, i) => {
    const item = items[i];
    if (result.status === "fulfilled") {
      synced.push(result.value);
    } else {
      const raw = result.reason as any;
      // Surface the Plaid error_code when available (e.g. ITEM_LOGIN_REQUIRED),
      // otherwise fall back to the JS error message.
      const errorCode: string =
        raw?.response?.data?.error_code ?? raw?.message ?? "Unknown error";
      console.error(
        `[sync] Item ${item.id} (${item.institutionName ?? "unknown"}) failed:`,
        raw
      );
      errors.push({
        plaidItemId: item.id,
        institutionName: item.institutionName,
        error: String(errorCode),
      });
    }
  });

  return NextResponse.json({ synced, errors });
}
