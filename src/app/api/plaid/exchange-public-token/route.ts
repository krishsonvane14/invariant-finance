import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { plaidItems } from "@/db/schema";

export async function POST(request: Request) {
  
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  
  const { public_token, institution_name } = await request.json();

  try {
    
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    
    const [newItem] = await db
      .insert(plaidItems)
      .values({
        userId: user.id,
        accessToken: accessToken,
        itemId: itemId,
        institutionName: institution_name || "Unknown Bank",
      })
      .returning({ id: plaidItems.id });

    // Trigger an initial sync for this item in the background.
    // Not awaited — exchange responds immediately; sync runs async.
    // Cookie is forwarded so the sync route can authenticate the same session.
    const host = request.headers.get("host") ?? "localhost:3000";
    const proto =
      request.headers.get("x-forwarded-proto") ??
      (process.env.NODE_ENV === "production" ? "https" : "http");

    fetch(`${proto}://${host}/api/plaid/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify({ plaidItemId: newItem.id }),
    }).catch((err) =>
      console.error("[exchange] Background sync trigger failed:", err)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Plaid Exchange Error:", error);
    return NextResponse.json(
      { error: "Failed to exchange token" },
      { status: 500 }
    );
  }
}