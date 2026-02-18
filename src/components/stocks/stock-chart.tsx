"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


const generateData = (basePrice: number) => {
  let price = basePrice;
  const data = [];
  const now = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (30 - i));
    

    const volatility = basePrice * 0.05;
    const change = (Math.random() - 0.5) * volatility;
    price += change;
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: price
    });
  }
  return data;
};

export function StockChart({ ticker, basePrice }: { ticker: string, basePrice: number }) {
  const data = generateData(basePrice);
  const startPrice = data[0].price;
  const endPrice = data[data.length - 1].price;
  const change = endPrice - startPrice;
  const percentChange = (change / startPrice) * 100;
  const isPositive = change >= 0;

  return (
    <Card className="bg-zinc-900 border-zinc-800 h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-4xl font-bold text-white">{ticker}</CardTitle>
                <div className="text-zinc-400 text-sm mt-1">NasdaqGS - Real Time Price</div>
            </div>
            <div className="text-right">
                <div className="text-3xl font-mono text-white">
                    ${endPrice.toFixed(2)}
                </div>
                <div className={`flex items-center justify-end gap-2 text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}{change.toFixed(2)} ({percentChange.toFixed(2)}%)
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                stroke="#52525b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                minTickGap={30}
              />
              <YAxis 
                hide 
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke={isPositive ? "#22c55e" : "#ef4444"} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPrice)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Fake Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-800">
            <div>
                <div className="text-xs text-zinc-500 uppercase">Market Cap</div>
                <div className="text-white font-medium">2.4T</div>
            </div>
            <div>
                <div className="text-xs text-zinc-500 uppercase">P/E Ratio</div>
                <div className="text-white font-medium">28.5</div>
            </div>
            <div>
                <div className="text-xs text-zinc-500 uppercase">52 Wk High</div>
                <div className="text-white font-medium">${(endPrice * 1.2).toFixed(2)}</div>
            </div>
            <div>
                <div className="text-xs text-zinc-500 uppercase">52 Wk Low</div>
                <div className="text-white font-medium">${(endPrice * 0.8).toFixed(2)}</div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}