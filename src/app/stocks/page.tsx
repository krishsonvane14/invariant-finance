"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Navbar } from "@/components/dashboard/navbar";
import { StockChart } from "@/components/stocks/stock-chart";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";


const WATCHLIST = [
  { symbol: "AAPL", name: "Apple Inc.", price: 182.50, change: 1.2 },
  { symbol: "TSLA", name: "Tesla, Inc.", price: 195.40, change: -2.5 },
  { symbol: "NVDA", name: "Nvidia Corp.", price: 780.10, change: 5.4 },
  { symbol: "MSFT", name: "Microsoft", price: 410.20, change: 0.8 },
  { symbol: "AMZN", name: "Amazon.com", price: 175.30, change: -0.4 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 140.60, change: 1.1 },
];

export default function StocksPage() {
  const [selectedStock, setSelectedStock] = useState(WATCHLIST[0]);
  const [search, setSearch] = useState("");

  const filteredList = WATCHLIST.filter(s => 
    s.symbol.toLowerCase().includes(search.toLowerCase()) || 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50">
      <div className="hidden md:block">
        <Sidebar user={{ user_metadata: { full_name: "User" } } as any} banks={[]} />
      </div>
      
      <div className="flex-1 md:pl-64 transition-all flex flex-col h-screen overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
             <div className="flex items-center gap-4">
                 <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input 
                        placeholder="Search for symbol (e.g. AAPL)..." 
                        className="pl-8 bg-zinc-100 dark:bg-zinc-900 border-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                 </div>
             </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar List */}
            <div className="w-80 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto hidden lg:block bg-zinc-50 dark:bg-zinc-950">
                <div className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Your Watchlist
                </div>
                <div className="space-y-1 px-2">
                    {filteredList.map((stock) => (
                        <div 
                            key={stock.symbol}
                            onClick={() => setSelectedStock(stock)}
                            className={`
                                flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all
                                ${selectedStock.symbol === stock.symbol ? 'bg-zinc-200 dark:bg-zinc-800' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900'}
                            `}
                        >
                            <div>
                                <div className="font-bold">{stock.symbol}</div>
                                <div className="text-xs text-zinc-500 truncate max-w-[120px]">{stock.name}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-medium">${stock.price.toFixed(2)}</div>
                                <div className={`text-xs ${stock.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {stock.change > 0 ? '+' : ''}{stock.change}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chart Area */}
            <div className="flex-1 p-6 overflow-y-auto bg-zinc-100 dark:bg-black">
                <div className="max-w-5xl mx-auto space-y-6">
                    <StockChart 
                       
                        key={selectedStock.symbol} 
                        ticker={selectedStock.symbol} 
                        basePrice={selectedStock.price} 
                    />

                    {/* News / Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                            <h3 className="font-bold mb-4">About {selectedStock.name}</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed">
                                This is a placeholder description for {selectedStock.name}. In a production application, 
                                you would connect this to a company profile API like Polygon.io or Yahoo Finance 
                                to display real-time news, sector details, and officer information.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                            <h3 className="font-bold mb-4">Analyst Ratings</h3>
                            <div className="flex items-center gap-4">
                                <div className="h-2 flex-1 bg-zinc-800 rounded-full overflow-hidden flex">
                                    <div className="bg-green-500 w-[60%]"></div>
                                    <div className="bg-yellow-500 w-[30%]"></div>
                                    <div className="bg-red-500 w-[10%]"></div>
                                </div>
                            </div>
                            <div className="flex justify-between text-xs text-zinc-500 mt-2">
                                <span>Buy (60%)</span>
                                <span>Hold (30%)</span>
                                <span>Sell (10%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}