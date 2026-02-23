"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function TruecallerResponseClient() {
  const searchParams = useSearchParams();
  const executed = useRef(false);

  useEffect(() => {
    if (executed.current) return;
    executed.current = true;

    const processTruecaller = async () => {
      const accessToken = searchParams.get("accessToken");
      const endpoint = searchParams.get("endpoint");

      if (!accessToken || !endpoint) {
        console.log("Missing params");
        return;
      }

      const res = await fetch("/api/truecaller/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessToken, endpoint }),
      });

      const data = await res.json();

      if (data.userId) {
        await signIn("truecaller", {
          userId: data.userId,
          callbackUrl: "/user",
        });
      }
    };

    processTruecaller();
  }, [searchParams]);

  return <div>Logging you in...</div>;
}