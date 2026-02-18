"use client";

import { Trash2 } from "lucide-react";
import { deleteBudget } from "@/app/actions/delete-budget";
import { useTransition } from "react";

export function DeleteBudgetButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => deleteBudget(id))}
      disabled={isPending}
      className="ml-2 text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-50"
      title="Delete Budget"
    >
      <Trash2 className="h-3 w-3" />
    </button>
  );
}