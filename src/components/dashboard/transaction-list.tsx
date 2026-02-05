"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Transaction {
  transaction_id: string;
  name: string;
  amount: number;
  date: string;
  institutionName: string;
  category: string[];
}

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch("/api/plaid/transactions");
        const data = await res.json();
        setTransactions(data);
      } catch (error) {
        console.error("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-zinc-500">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="text-sm text-zinc-500">No transactions found.</div>
        ) : (
          <div className="space-y-4">
            {transactions.map((t) => (
              <div
                key={t.transaction_id}
                className="flex items-center justify-between border-b border-zinc-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none text-zinc-900">
                    {t.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {t.institutionName} • {t.date}
                  </p>
                </div>
                <div className={`font-mono text-sm font-medium ${t.amount > 0 ? "text-zinc-900" : "text-green-600"}`}>
                  {/* Plaid logic: Positive = Spending, Negative = Income */}
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(t.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}