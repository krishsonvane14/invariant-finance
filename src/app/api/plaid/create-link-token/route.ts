import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { createClient } from "@/lib/supabase/server";
import { CountryCode, Products } from "plaid"; 

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tokenResponse = await plaidClient.linkTokenCreate({
      user: { client_user_id: user.id },
      client_name: "Invariant",
      products: [Products.Transactions], 
      language: "en",
      country_codes: [CountryCode.Us, CountryCode.Ca], 
    });

    return NextResponse.json(tokenResponse.data);
  } catch (error) {
    console.error("Plaid Error:", error);
    return NextResponse.json(
      { error: "Failed to create link token" },
      { status: 500 }
    );
  }
}