import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { plaidItems } from "@/db/schema";

export async function POST(request: Request) {
  // 1. Auth Check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Get the public token from the frontend
  const { public_token, institution_name } = await request.json();

  try {
    // 3. Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // 4. Save to Database
    await db.insert(plaidItems).values({
      userId: user.id,
      accessToken: accessToken,
      itemId: itemId,
      institutionName: institution_name || "Unknown Bank",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Plaid Exchange Error:", error);
    return NextResponse.json(
      { error: "Failed to exchange token" },
      { status: 500 }
    );
  }
}