"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { budgets } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function createBudget(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  const category = formData.get("category") as string;
  const amount = formData.get("amount") as string;

  await db.insert(budgets).values({
    userId: user.id,
    category,
    amount,
  });

  revalidatePath("/");
}