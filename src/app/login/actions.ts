"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function login() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error) {
    console.error(error);
    return redirect("/login?error=true");
  }

  if (data.url) {
    redirect(data.url);
  }
}