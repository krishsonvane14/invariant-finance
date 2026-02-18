"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { cleanTransactionName } from "@/lib/cleaner";

export type Transaction = {
  transaction_id: string;
  name: string;
  amount: number;
  date: string;
  category: string[];
  institutionName: string;
};

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <div className="text-zinc-500">{row.getValue("date")}</div>,
  },
  {
    accessorKey: "name",
    header: "Merchant",
    cell: ({ row }) => {
      const raw = row.original.name;
      const { name, logo } = cleanTransactionName(raw);
      return (
        <div className="flex items-center gap-2">
          <span className="text-lg">{logo}</span>
          <span className="font-medium">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const cats = row.getValue("category") as string[];
      const main = cats ? cats[0] : "Uncategorized";
      return <Badge variant="secondary" className="font-normal">{main}</Badge>;
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      
      return (
        <div className={`font-medium ${amount > 0 ? "text-zinc-900 dark:text-zinc-50" : "text-green-600"}`}>
          {formatted}
        </div>
      );
    },
  },
];