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
    <Card className="col-span-1 lg:col-span-2 bg-surface border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Recent Activity
        </CardTitle>
        <Badge variant="outline" className="text-muted-foreground border-border text-xs">
          {sortedTransactions.length} found
        </Badge>
      </CardHeader>
      <CardContent>
        {sortedTransactions.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <CreditCard className="mx-auto h-10 w-10 mb-3 opacity-20" />
            <p className="text-sm">No recent transactions</p>
          </div>
        ) : (
          <div className="space-y-1">
            {visibleTransactions.map((t) => (
              <div
                key={t.transaction_id}
                className="flex items-center justify-between p-3 hover:bg-muted transition-colors border-l-2 border-transparent hover:border-border"
              >
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className={`font-bold text-sm tabular-nums ${t.amount < 0 ? "text-[#6b8f71]" : "text-foreground"}`}>
                  {t.amount < 0 ? "+" : "-"}${Math.abs(t.amount).toFixed(2)}
                </div>
              </div>
            ))}

            <div className="pt-4 flex flex-col gap-2 border-t border-border mt-2">
              {sortedTransactions.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground hover:text-foreground text-xs tracking-widest uppercase"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <span className="flex items-center gap-2">&gt; show less <ChevronUp className="h-3 w-3" /></span>
                  ) : (
                    <span className="flex items-center gap-2">&gt; show more <ChevronDown className="h-3 w-3" /></span>
                  )}
                </Button>
              )}

              <Button variant="outline" className="w-full border-border text-muted-foreground hover:text-foreground text-xs tracking-widest uppercase" asChild>
                <Link href="/transactions">
                  &gt; View Full History <ArrowRight className="ml-2 h-3 w-3 opacity-50" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
