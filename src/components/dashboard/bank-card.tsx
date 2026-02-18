"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface BankCardProps {
  bank: {
    id: string;
    institutionName: string | null;
    itemId: string;
  };
}

export function BankCard({ bank }: BankCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to disconnect this bank?")) return;
    
    setLoading(true);
    await fetch("/api/plaid/delete", {
      method: "POST",
      body: JSON.stringify({ id: bank.id }),
    });
    
    router.refresh(); 
    setLoading(false);
  };

  return (
    <Card className="hover:shadow-md transition-shadow bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 relative group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {bank.institutionName}
        </CardTitle>
        
        {/* Status Dot */}
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      </CardHeader>
      
      <CardContent>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-xs text-green-600 bg-green-50 dark:bg-green-900/30 w-fit px-2 py-1 rounded-full font-medium">
             Active
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDelete}
            disabled={loading}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}