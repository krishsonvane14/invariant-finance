"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const supabase = createClient();
    
    // This calls the real Google Login
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // This redirects back to your dashboard after login
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-white p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Invariant</h1>
          <p className="text-sm text-zinc-500">
            Sign in to track your net worth
          </p>
        </div>
        
        <Button 
          className="w-full bg-black text-white hover:bg-zinc-800 h-10 font-medium" 
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Connecting to Google..." : "Sign in with Google"}
        </Button>
      </div>
    </div>
  );
}