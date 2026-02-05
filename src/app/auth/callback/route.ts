import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Successful login -> Go to Dashboard
      return NextResponse.redirect(`${origin}`);
    }
  }

  // Login failed -> Go back to login page
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}