import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { plaidItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();

  try {
   
    await db
      .delete(plaidItems)
      .where(and(
        eq(plaidItems.id, id),
        eq(plaidItems.userId, user.id)
      ));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}