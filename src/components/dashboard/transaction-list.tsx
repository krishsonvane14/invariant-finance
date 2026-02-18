"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ArrowRight, CreditCard } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function TransactionList({ transactions = [] }: { transactions?: any[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  
  const visibleTransactions = isExpanded 
    ? sortedTransactions.slice(0, 10) 
    : sortedTransactions.slice(0, 5);

  return (
    <Card className="col-span-1 lg:col-span-2 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Recent Activity
        </CardTitle>
        <Badge variant="outline" className="text-zinc-500">
          {sortedTransactions.length} found
        </Badge>
      </CardHeader>
      <CardContent>
        {sortedTransactions.length === 0 ? (
          <div className="text-center py-10 text-zinc-500">
            <CreditCard className="mx-auto h-10 w-10 mb-3 opacity-20" />
            <p>No recent transactions</p>
          </div>
        ) : (
          <div className="space-y-4">

            {visibleTransactions.map((t) => (
              <div 
                key={t.transaction_id} 
                className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800"
              >
                <div className="flex items-center gap-4">

                  <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-lg">

                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 line-clamp-1">
                      {t.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className={`font-semibold text-sm ${t.amount < 0 ? "text-green-600" : "text-zinc-900 dark:text-zinc-50"}`}>
                  {t.amount < 0 ? "+" : "-"}${Math.abs(t.amount).toFixed(2)}
                </div>
              </div>
            ))}

            <div className="pt-4 flex flex-col gap-3 border-t border-zinc-100 dark:border-zinc-800 mt-4">

              {sortedTransactions.length > 5 && (
                <Button 
                    variant="ghost" 
                    size="sm"
                    className="w-full text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200" 
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? (
                        <span className="flex items-center gap-2">Show Less <ChevronUp className="h-4 w-4"/></span>
                    ) : (
                        <span className="flex items-center gap-2">Show More <ChevronDown className="h-4 w-4"/></span>
                    )}
                </Button>
              )}

              <Button variant="outline" className="w-full border-zinc-200 dark:border-zinc-800" asChild>
                <Link href="/transactions">
                   View Full History <ArrowRight className="ml-2 h-4 w-4 opacity-50" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}