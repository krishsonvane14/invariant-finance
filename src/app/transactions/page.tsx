import { Sidebar } from "@/components/dashboard/sidebar";
import { Navbar } from "@/components/dashboard/navbar";
import { DataTable } from "@/components/transactions/data-table";
import { columns } from "@/components/transactions/columns";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { plaidItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { plaidClient } from "@/lib/plaid";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const banks = await db.select().from(plaidItems).where(eq(plaidItems.userId, user.id));

  let allTransactions: any[] = [];
  await Promise.all(
    banks.map(async (bank) => {
      try {
        const res = await plaidClient.transactionsSync({ access_token: bank.accessToken });
        const labeledTransactions = res.data.added.map(t => ({
            ...t,
            institutionName: bank.institutionName
        }));
        allTransactions.push(...labeledTransactions);
      } catch (err) { console.error(err); }
    })
  );

  allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black">
      <Sidebar user={user} banks={banks} />
      
      <div className="flex-1 pl-4 transition-all">
        <Navbar user={user} />
        
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Transactions</h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    View and filter your entire spending history.
                </p>
            </div>

            <DataTable columns={columns} data={allTransactions} />
        </div>
      </div>
    </div>
  );
}