import {
  boolean,
  date,
  index,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";


// ---------------------------------------------------------------------------
// Existing tables (unchanged)
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const plaidItems = pgTable("plaid_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  accessToken: text("access_token").notNull(),
  itemId: text("item_id").notNull(),
  institutionName: text("institution_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // text intentionally — pre-existing, do not change
  category: text("category").notNull(),
  amount: numeric("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});


// ---------------------------------------------------------------------------
// accounts
// Mirrors Plaid Account objects from accountsBalanceGet.
// One row per Plaid account (checking, savings, credit card, etc.).
// FK parent for transactions.
// ---------------------------------------------------------------------------

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Ownership / relationships
    plaidItemId: uuid("plaid_item_id")
      .notNull()
      .references(() => plaidItems.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Plaid identifiers
    plaidAccountId: text("plaid_account_id").notNull().unique(),

    // Account metadata
    name: text("name").notNull(),
    officialName: text("official_name"),
    type: text("type").notNull(),       // "depository" | "credit" | "investment" | "loan" | "other"
    subtype: text("subtype"),           // "checking" | "savings" | "credit card" | etc.
    mask: text("mask"),                 // Last 4 digits of account number

    // Balances — numeric(14,2) for exact currency arithmetic
    currentBalance: numeric("current_balance", { precision: 14, scale: 2 }),
    availableBalance: numeric("available_balance", { precision: 14, scale: 2 }),
    isoCurrencyCode: text("iso_currency_code"),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("accounts_user_id_idx").on(t.userId),
    index("accounts_plaid_item_id_idx").on(t.plaidItemId),
    // plaidAccountId unique index is created automatically by .unique() above
  ]
);


// ---------------------------------------------------------------------------
// transactions
// Mirrors Plaid Transaction objects. Populated and kept current via
// sync_cursors + transactionsSync incremental syncs.
// ---------------------------------------------------------------------------

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Ownership / relationships
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    plaidItemId: uuid("plaid_item_id")
      .notNull()
      .references(() => plaidItems.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Plaid identifier — unique; used as the upsert key
    plaidTransactionId: text("plaid_transaction_id").notNull().unique(),

    // Core fields
    name: text("name").notNull(),
    merchantName: text("merchant_name"),
    // Plaid sign convention: positive = debit (money out), negative = credit (money in)
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    date: date("date").notNull(),
    authorizedDate: date("authorized_date"),
    pending: boolean("pending").default(false).notNull(),
    paymentChannel: text("payment_channel"),  // "online" | "in store" | "other"

    // Categories — both modern and legacy stored to support existing budget-matching logic
    categoryPrimary: text("category_primary"),    // personal_finance_category.primary
    categoryDetailed: text("category_detailed"),  // personal_finance_category.detailed
    categoryLegacy: text("category_legacy").array(), // legacy category string[]

    // Extras
    logoUrl: text("logo_url"),
    // Denormalized institution name to avoid a join when rendering transaction lists
    institutionName: text("institution_name"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    // Primary query pattern: user's transactions newest-first
    index("transactions_user_id_date_idx").on(t.userId, t.date),
    index("transactions_account_id_idx").on(t.accountId),
    index("transactions_plaid_item_id_idx").on(t.plaidItemId),
    index("transactions_user_id_pending_idx").on(t.userId, t.pending),
    // plaidTransactionId unique index is created automatically by .unique() above
  ]
);


// ---------------------------------------------------------------------------
// sync_cursors
// One row per plaid_item. Stores the Plaid transactionsSync cursor so that
// incremental syncs only fetch what changed since the last run.
// A null cursor means no sync has run yet (triggers a full initial sync).
// ---------------------------------------------------------------------------

export const syncCursors = pgTable(
  "sync_cursors",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    plaidItemId: uuid("plaid_item_id")
      .notNull()
      .unique()
      .references(() => plaidItems.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Opaque cursor string from Plaid. Null = no sync run yet.
    cursor: text("cursor"),
    lastSyncedAt: timestamp("last_synced_at"),
  },
  (t) => [
    index("sync_cursors_user_id_idx").on(t.userId),
    // plaidItemId unique index is created automatically by .unique() above
  ]
);


// ---------------------------------------------------------------------------
// net_worth_history
// Daily aggregate snapshots of a user's total net worth (sum of all account
// current balances). One row per user per day. Enables trend charts without
// live Plaid API calls.
// ---------------------------------------------------------------------------

export const netWorthHistory = pgTable(
  "net_worth_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    date: date("date").notNull(),
    // Can be negative (liabilities exceed assets)
    netWorth: numeric("net_worth", { precision: 14, scale: 2 }).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    // One snapshot per user per day — also the upsert key
    uniqueIndex("net_worth_history_user_id_date_idx").on(t.userId, t.date),
  ]
);
