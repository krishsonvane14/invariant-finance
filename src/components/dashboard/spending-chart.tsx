"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Transaction {
  amount: number;
  category: string[] | null;
  personal_finance_category?: {
    primary: string;
  };
  name: string;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export function SpendingChart() {
  const [data, setData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/plaid/transactions");
        const transactions: Transaction[] = await res.json();

        const categoryTotals: Record<string, number> = {};
        
        transactions.forEach((t) => {
          if (t.amount <= 0) return; 

          let categoryName = "Uncategorized";

          if (t.personal_finance_category?.primary) {
            
            categoryName = t.personal_finance_category.primary
              .replace(/_/g, " ")
              .toLowerCase()
              .replace(/\b\w/g, (l) => l.toUpperCase());
          } else if (t.category && t.category.length > 0) {
            categoryName = t.category[0];
          }
          
          categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + t.amount;
        });

        const chartData = Object.keys(categoryTotals).map((key, index) => ({
          name: key,
          value: categoryTotals[key],
          color: COLORS[index % COLORS.length],
        }));

        setData(chartData);
      } catch (error) {
        console.error("Chart Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          {loading ? (
             <div className="flex h-full items-center justify-center text-sm text-zinc-500">
               Loading...
             </div>
          ) : data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
              No spending data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                  contentStyle={{ backgroundColor: "#000", color: "#fff", borderRadius: "8px", border: "none" }}
                  itemStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="mt-4 space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-zinc-600">{item.name}</span>
              </div>
              <span className="font-medium">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(item.value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}