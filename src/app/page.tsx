import { Navbar } from "@/components/dashboard/navbar";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaidLink } from "@/components/dashboard/plaid-link";
import { TransactionList } from "@/components/dashboard/transaction-list";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { BankCard } from "@/components/dashboard/bank-card";
import { AddBudgetDialog } from "@/components/dashboard/add-budget-dialog";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { plaidItems, budgets, accounts, transactions } from "@/db/schema";
import { and, desc, eq, gte, sum } from "drizzle-orm";
import { DeleteBudgetButton } from "@/components/dashboard/delete-budget-button";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const past30Days = new Date();
  past30Days.setDate(past30Days.getDate() - 30);
  const startDate = past30Days.toISOString().split("T")[0];

  // Four independent DB queries run in parallel — replaces N+1 live Plaid API calls
  const [banks, userBudgets, netWorthResult, dbTransactions] = await Promise.all([
    db.select().from(plaidItems).where(eq(plaidItems.userId, user.id)),
    db.select().from(budgets).where(eq(budgets.userId, user.id)),
    db
      .select({ total: sum(accounts.currentBalance) })
      .from(accounts)
      .where(eq(accounts.userId, user.id)),
    db
      .select()
      .from(transactions)
      .where(and(eq(transactions.userId, user.id), gte(transactions.date, startDate)))
      .orderBy(desc(transactions.date))
      .limit(500),
  ]);

  // sum() returns null when accounts table is empty — $0 is the correct empty state
  const totalNetWorth = parseFloat(netWorthResult[0]?.total ?? "0");
  const formattedNetWorth = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalNetWorth);

  // Map DB rows to the shape the existing JSX already expects — no JSX changes needed.
  // amount: numeric string → number; transaction_id: renamed from plaidTransactionId;
  // personal_finance_category: reconstructed from categoryPrimary.
  const allTransactions: any[] = dbTransactions.map((t) => ({
    transaction_id: t.plaidTransactionId,
    name: t.name,
    date: t.date,
    amount: parseFloat(t.amount),
    personal_finance_category: t.categoryPrimary ? { primary: t.categoryPrimary } : null,
  }));

  return (
    <DashboardLayout user={user} banks={banks}>
      <Navbar user={user} />
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
              <p className="text-xs text-muted-foreground tracking-widest uppercase mt-1">
                Last 30 Days
              </p>
            </div>
            <PlaidLink />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="space-y-6 md:col-span-1">
              <Card className="bg-surface border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Total Net Worth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold tracking-tight text-foreground">{formattedNetWorth}</div>
                  <p className="text-xs text-muted-foreground mt-1">Across {banks.length} banks</p>
                </CardContent>
              </Card>

              <Card className="bg-surface border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Monthly Budgets</CardTitle>
                  <AddBudgetDialog />
                </CardHeader>
                <CardContent className="space-y-4">
                  {userBudgets.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No budgets set yet.</p>
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
                              <span className="font-medium text-foreground">{budget.category}</span>
                              <DeleteBudgetButton id={budget.id} />
                            </div>
                            <span className={isOver ? "text-brand font-bold" : "text-muted-foreground"}>
                              ${Math.round(spent)} / ${limit}
                            </span>
                          </div>
                          <div className="h-1.5 bg-muted overflow-hidden">
                            <div 
                              className={`h-full ${isOver ? "bg-brand" : "bg-[#6b8f71]"}`}
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
                    <h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-widest">Your Accounts</h3>
                    {banks.length === 0 ? (
                       <div className="text-sm text-muted-foreground italic">No connected accounts</div>
                    ) : (
                       banks.map((bank) => <BankCard key={bank.id} bank={bank} />)
                    )}
                 </div>
              </div>
              <TransactionList transactions={allTransactions} />
            </div>

          </div>
        </div>
    </DashboardLayout>
  );
}