import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaidLink } from "@/components/dashboard/plaid-link";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { plaidItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { plaidClient } from "@/lib/plaid";

export default async function Home() {
  // 1. Get User
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Fetch Connected Banks from DB
  const banks = await db
    .select()
    .from(plaidItems)
    .where(eq(plaidItems.userId, user?.id!));

  // 3. FETCH REAL BALANCES (The New Magic)
  let totalNetWorth = 0;
  let accountCount = 0;

  // We use Promise.all to fetch all banks at the same time (faster)
  await Promise.all(
    banks.map(async (bank) => {
      try {
        const response = await plaidClient.accountsBalanceGet({
          access_token: bank.accessToken,
        });
        
        // Add up the balances of all accounts in this bank
        const bankTotal = response.data.accounts.reduce((acc, account) => {
          return acc + (account.balances.current || 0);
        }, 0);

        totalNetWorth += bankTotal;
        accountCount += response.data.accounts.length;
      } catch (err) {
        console.error("Error fetching balance for bank:", bank.institutionName);
      }
    })
  );

  // Format currency (e.g. 15000 -> "$15,000.00")
  const formattedNetWorth = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalNetWorth);

  return (
    <div className="p-8 space-y-8 bg-zinc-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Invariant</h1>
          <p className="text-zinc-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <PlaidLink />
      </div>

      {/* Net Worth Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black text-white border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Net Worth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tracking-tight">{formattedNetWorth}</div>
            <p className="text-xs text-zinc-400 mt-1">
              Across {banks.length} banks and {accountCount} accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Connected Accounts List */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-zinc-900">Connected Institutions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {banks.length === 0 ? (
            <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg border-zinc-200">
              <p className="text-zinc-500">No accounts connected yet.</p>
              <p className="text-xs text-zinc-400">Click the button above to start.</p>
            </div>
          ) : (
            banks.map((bank) => (
              <Card key={bank.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-semibold">{bank.institutionName}</CardTitle>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-zinc-500 font-mono mt-1">
                    ID: {bank.itemId.slice(0, 8)}...
                  </p>
                  <div className="mt-4 flex items-center text-xs text-green-600 bg-green-50 w-fit px-2 py-1 rounded-full font-medium">
                    Active Connection
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}