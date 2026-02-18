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

  
  const banks = await db
    .select()
    .from(plaidItems)
    .where(eq(plaidItems.userId, user.id));

  
  const endDate = new Date().toISOString().split("T")[0]; 
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); 
  const startDateString = startDate.toISOString().split("T")[0];

  let allTransactions: any[] = [];

  
  await Promise.all(
    banks.map(async (bank) => {
      try {
        const response = await plaidClient.transactionsGet({
          access_token: bank.accessToken,
          start_date: startDateString,
          end_date: endDate,
        });

        
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

  
  allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json(allTransactions);
}