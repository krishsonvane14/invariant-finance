'use server'

import { db } from "@/db";
import { budgets } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteBudget(budgetId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return;

  await db.delete(budgets)
    .where(
        and(
            eq(budgets.id, budgetId),
            eq(budgets.userId, user.id)
        )
    );

  revalidatePath("/");
}