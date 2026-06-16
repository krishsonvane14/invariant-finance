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
    <Card className="bg-surface border-border relative group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          {bank.institutionName}
        </CardTitle>

        {/* Active pulse dot */}
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full bg-[#6b8f71] opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 bg-[#6b8f71]"></span>
        </span>
      </CardHeader>

      <CardContent>
        <div className="mt-2 flex justify-between items-center">
          <div className="text-xs text-[#6b8f71] bg-[#6b8f71]/10 w-fit px-2 py-1 font-medium tracking-widest uppercase">
            active
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-brand hover:bg-brand/10 opacity-0 group-hover:opacity-100 transition-opacity"
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
