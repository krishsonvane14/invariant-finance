"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DailyBarChart({ transactions }: { transactions: any[] }) {
  
  const chartData = transactions.reduce((acc: any[], curr) => {
    
    const val = Math.abs(curr.amount);
    if (val === 0) return acc;

    const date = new Date(curr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const existing = acc.find((d: any) => d.date === date);
    if (existing) {
      existing.amount += val;
    } else {
      acc.push({ date, amount: val });
    }
    return acc;
  }, []).reverse();

  return (
    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
      <CardHeader><CardTitle className="text-sm font-medium">Daily History</CardTitle></CardHeader>
      <CardContent className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{fill: 'rgba(255,255,255,0.05)'}}
              contentStyle={{ borderRadius: '8px', backgroundColor: '#18181b', border: 'none', color: '#fff' }} 
            />
            <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}