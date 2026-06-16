"use client";

import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  TrendingUp,
  Banknote,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SidebarProps {
  user: any;
  banks: any[];
}

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/transactions", icon: CreditCard, label: "Transactions" },
  { href: "/income", icon: Banknote, label: "Income" },
  { href: "/stocks", icon: TrendingUp, label: "Stocks" },
];

export function Sidebar({ user, banks }: SidebarProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <div className="sticky top-0 self-start h-screen w-14 hover:w-64 transition-all duration-300 group shrink-0 flex flex-col bg-zinc-950 text-zinc-400 border-r border-zinc-800 overflow-hidden z-30">

      {/* Header */}
      <div className="flex items-center gap-3 px-3 h-16 border-b border-zinc-800/60 shrink-0">
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0">
          I
        </div>
        <span className="font-bold text-white text-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">
          Invariant
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}>
            <div className="flex items-center gap-3 px-2 py-2.5 rounded-md text-sm font-medium hover:bg-zinc-800 hover:text-white transition-colors">
              <Icon className="h-5 w-5 shrink-0" />
              <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">
                {label}
              </span>
            </div>
          </Link>
        ))}

        {/* Connected accounts — only legible when expanded */}
        <div className="pt-6">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">
            Connected Accounts
          </p>

          {banks.length === 0 ? (
            <p className="px-2 text-xs text-zinc-600 italic whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">
              No accounts yet
            </p>
          ) : (
            banks.map((bank) => (
              <div
                key={bank.id}
                className="flex items-center gap-2 px-2 py-2 text-sm hover:text-white cursor-pointer"
              >
                <Wallet className="h-4 w-4 shrink-0" />
                <span className="truncate whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">
                  {bank.institutionName}
                </span>
              </div>
            ))
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-zinc-800/60 shrink-0">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-2 text-zinc-400 hover:text-red-400 hover:bg-red-900/10"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">
            Log out
          </span>
        </Button>
      </div>
    </div>
  );
}
