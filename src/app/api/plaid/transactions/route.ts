import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { plaidItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1. Get all connected banks
  const banks = await db
    .select()
    .from(plaidItems)
    .where(eq(plaidItems.userId, user.id));

  // 2. Define the time range (Last 30 days)
  const endDate = new Date().toISOString().split("T")[0]; // Today
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // 30 days ago
  const startDateString = startDate.toISOString().split("T")[0];

  let allTransactions: any[] = [];

  // 3. Loop through every bank and fetch transactions
  await Promise.all(
    banks.map(async (bank) => {
      try {
        const response = await plaidClient.transactionsGet({
          access_token: bank.accessToken,
          start_date: startDateString,
          end_date: endDate,
        });

        // Add the bank name to each transaction so we know where it came from
        const transactionsWithBankName = response.data.transactions.map((t) => ({
          ...t,
          institutionName: bank.institutionName,
        }));

        allTransactions.push(...transactionsWithBankName);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    })
  );

  // 4. Sort by date (Newest first)
  allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json(allTransactions);
}