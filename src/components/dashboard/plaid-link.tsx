"use client";

import { useCallback, useEffect, useState } from "react";
import { usePlaidLink, PlaidLinkOnSuccess } from "react-plaid-link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function PlaidLink() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const createToken = async () => {
      const response = await fetch("/api/plaid/create-link-token", {
        method: "POST",
      });
      const data = await response.json();
      setToken(data.link_token);
    };
    createToken();
  }, []);

  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    async (public_token, metadata) => {
      
      await fetch("/api/plaid/exchange-public-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_token,
          institution_name: metadata.institution?.name,
        }),
      });

      alert("Bank Connected & Saved!");
      router.refresh(); 
    },
    [router]
  );

  const { open, ready } = usePlaidLink({
    token,
    onSuccess,
  });

  return (
    <Button
      onClick={() => open()}
      disabled={!ready}
      className="bg-black text-white hover:bg-zinc-800"
    >
      Connect Bank Account
    </Button>
  );
}