import { Navbar } from "@/components/dashboard/navbar"; 
import { Sidebar } from "@/components/dashboard/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaidLink } from "@/components/dashboard/plaid-link";
import { TransactionList } from "@/components/dashboard/transaction-list";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { BankCard } from "@/components/dashboard/bank-card";
import { AddBudgetDialog } from "@/components/dashboard/add-budget-dialog";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { plaidItems, budgets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { plaidClient } from "@/lib/plaid";
import { DeleteBudgetButton } from "@/components/dashboard/delete-budget-button";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const banks = await db.select().from(plaidItems).where(eq(plaidItems.userId, user.id));
  const userBudgets = await db.select().from(budgets).where(eq(budgets.userId, user.id));

  let totalNetWorth = 0;
  let allTransactions: any[] = [];
  

  const now = new Date();
  const past30Days = new Date();
  past30Days.setDate(now.getDate() - 30); 

  const startDate = past30Days.toISOString().split('T')[0]; 
  const endDate = now.toISOString().split('T')[0];

  await Promise.all(
    banks.map(async (bank) => {
      try {
        const balanceRes = await plaidClient.accountsBalanceGet({ access_token: bank.accessToken });
        const bankTotal = balanceRes.data.accounts.reduce((acc, a) => acc + (a.balances.current || 0), 0);
        totalNetWorth += bankTotal;

        const txnRes = await plaidClient.transactionsGet({ 
            access_token: bank.accessToken,
            start_date: startDate,
            end_date: endDate,
            options: { count: 500 }
        });
        
        allTransactions.push(...txnRes.data.transactions);
      } catch (err) { console.error("Plaid Error:", err); }
    })
  );

  const formattedNetWorth = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalNetWorth);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <Sidebar user={user} banks={banks} />

      <div className="pl-4 transition-all">
        <Navbar user={user} />

        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h1>
              <p className="text-zinc-500 dark:text-zinc-400">
                Last 30 Days
              </p>
            </div>
            <PlaidLink />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="space-y-6 md:col-span-1">
              <Card className="bg-zinc-900 text-white border-zinc-800 shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">Total Net Worth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold tracking-tight">{formattedNetWorth}</div>
                  <p className="text-xs text-zinc-400 mt-1">Across {banks.length} banks</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">Monthly Budgets</CardTitle>
                  <AddBudgetDialog />
                </CardHeader>
                <CardContent className="space-y-4">
                  {userBudgets.length === 0 ? (
                    <p className="text-sm text-zinc-500 text-center py-4">No budgets set yet.</p>
                  ) : (
                    userBudgets.map((budget) => {
                      const spent = allTransactions
                      .filter((t) => {

                        if (t.amount < 0) return false;

                        const cleanBudget = budget.category.toLowerCase().replace(/[^a-z]/g, "");

                        let legacyMatch = false;
                        if (t.category && t.category.length > 0) {
                             legacyMatch = t.category.some((c: string) => 
                                c.toLowerCase().replace(/[^a-z]/g, "").includes(cleanBudget)
                             );
                        }

                        let modernMatch = false;
                        if (t.personal_finance_category && t.personal_finance_category.primary) {
                            const pfc = t.personal_finance_category.primary.toLowerCase().replace(/[^a-z]/g, "");
                            if (pfc.includes(cleanBudget)) modernMatch = true;
                        }

                        return legacyMatch || modernMatch;
                      })
                      .reduce((sum, t) => sum + t.amount, 0);

                      const limit = parseFloat(budget.amount);
                      const percent = Math.min((spent / limit) * 100, 100);
                      const isOver = spent > limit;

                      return (
                        <div key={budget.id}>
                        <div className="flex justify-between items-center text-sm mb-1">
                            <div className="flex items-center">
                              <span className="font-medium">{budget.category}</span>
                              <DeleteBudgetButton id={budget.id} />
                            </div>
                            <span className={isOver ? "text-red-500 font-bold" : "text-zinc-500"}>
                              ${Math.round(spent)} / ${limit}
                            </span>
                          </div>
                          <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${isOver ? "bg-red-500" : "bg-green-500"}`} 
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <SpendingChart />
                 <div className="space-y-4">
                    <h3 className="font-semibold text-zinc-500 text-sm uppercase tracking-wider">Your Accounts</h3>
                    {banks.length === 0 ? (
                       <div className="text-sm text-zinc-500 italic">No connected accounts</div>
                    ) : (
                       banks.map((bank) => <BankCard key={bank.id} bank={bank} />)
                    )}
                 </div>
              </div>
              <TransactionList transactions={allTransactions} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}