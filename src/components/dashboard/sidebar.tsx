"use client";

import { 
  LayoutDashboard, 
  CreditCard, 
  Wallet,
  TrendingUp,
  Banknote, 
  LogOut
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SidebarProps {
  user: any;
  banks: any[];
}

export function Sidebar({ user, banks }: SidebarProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    
    <div className="fixed left-0 top-0 h-full z-50 w-4 hover:w-64 transition-all duration-300 group overflow-hidden">
      
      
      <div className="absolute left-0 top-0 h-full w-1 bg-zinc-300 dark:bg-zinc-700 group-hover:opacity-0 transition-opacity" />

      
      <div className="h-full w-64 bg-zinc-950 text-zinc-400 border-r border-zinc-800 -translate-x-[calc(100%-1rem)] group-hover:translate-x-0 transition-transform duration-300 flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-6 min-w-[256px]"> {/* min-w ensure text doesn't wrap */}
          <div className="flex items-center gap-2 font-bold text-white text-xl">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">I</div>
            <span>Invariant</span>
          </div>
        </div>

{/* Navigation */}
        <div className="flex-1 px-4 space-y-2 overflow-y-auto min-w-[256px]">
          <Link href="/">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-zinc-900 hover:text-white transition-colors">
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span>Dashboard</span>
            </div>
          </Link>
          
          { }
          <Link href="/transactions">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer">
              <CreditCard className="h-4 w-4 shrink-0" />
              <span>Transactions</span>
            </div>
          </Link>

        
          <Link href="/income">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer">
              <Banknote className="h-4 w-4 shrink-0" />
              <span>Income</span>
            </div>
          </Link>

          <Link href="/stocks">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer">
              <TrendingUp className="h-4 w-4 shrink-0" />
              <span>Stocks</span>
            </div>
          </Link>
          <div className="pt-8 pb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-600">
            Connected Accounts
          </div>
          
          {banks.length === 0 ? (
            <div className="px-3 text-xs text-zinc-600 italic">No accounts yet</div>
          ) : (
            banks.map((bank) => (
              <div key={bank.id} className="px-3 py-2 text-sm flex items-center gap-2 hover:text-white cursor-pointer truncate">
                <Wallet className="h-3 w-3 shrink-0" />
                <span className="truncate">{bank.institutionName}</span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-900 min-w-[256px]">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-zinc-400 hover:text-red-400 hover:bg-red-900/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Log out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}