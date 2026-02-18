import { Sidebar } from "@/components/dashboard/sidebar";
import { Navbar } from "@/components/dashboard/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { plaidItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { plaidClient } from "@/lib/plaid";
import { DailyBarChart } from "@/components/dashboard/daily-bar-chart";

export default async function IncomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const banks = await db.select().from(plaidItems).where(eq(plaidItems.userId, user.id));

  const now = new Date();
  const pastYear = new Date();
  pastYear.setFullYear(now.getFullYear() - 1);

  const startDate = pastYear.toISOString().split('T')[0];
  const endDate = now.toISOString().split('T')[0];

  let incomeTransactions: any[] = [];
  let totalIncome = 0;

  await Promise.all(
    banks.map(async (bank) => {
      try {
        const res = await plaidClient.transactionsGet({
          access_token: bank.accessToken,
          start_date: startDate,
          end_date: endDate,
          options: { count: 500 }
        });

        const inflows = res.data.transactions
          .filter(t => t.amount < 0)
          .map(t => ({
             ...t,
             amount: Math.abs(t.amount),
             institutionName: bank.institutionName
          }));
        
        incomeTransactions.push(...inflows);
      } catch (err) { console.error(err); }
    })
  );

  totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const monthlyAverage = totalIncome / 12;

  incomeTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black">
      <Sidebar user={user} banks={banks} />
      
      <div className="flex-1 pl-4 transition-all">
        <Navbar user={user} />
        
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Income</h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Track your earnings, paychecks, and deposits.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-green-900/10 border-green-900/20">
                    <CardHeader><CardTitle className="text-green-600">Total Income (YTD)</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-green-700 dark:text-green-400">
                            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalIncome)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Monthly Average</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(monthlyAverage)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <DailyBarChart transactions={incomeTransactions} />
                </div>
                
                <div className="space-y-4">
                    <h3 className="font-semibold text-zinc-500 text-sm uppercase">Recent Deposits</h3>
                    {incomeTransactions.slice(0, 10).map((t) => (
                        <div key={t.transaction_id} className="flex justify-between items-center p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                            <div>
                                <div className="font-medium text-zinc-900 dark:text-zinc-50">{t.name}</div>
                                <div className="text-xs text-zinc-500">{t.date}</div>
                            </div>
                            <div className="font-bold text-green-600">
                                +{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(t.amount)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}