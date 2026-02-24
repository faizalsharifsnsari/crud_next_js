"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function TruecallerResponseClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const executed = useRef(false);

  useEffect(() => {
    console.log("🔥 Truecaller response page loaded");

    if (executed.current) return;
    executed.current = true;

    const accessToken = searchParams.get("accessToken");
    const endpoint = searchParams.get("endpoint");

    console.log("Query string:", searchParams.toString());
    console.log("AccessToken:", accessToken);
    console.log("Endpoint:", endpoint);

    if (!accessToken || !endpoint) {
      console.log("❌ Missing params");
      return;
    }

    const processTruecaller = async () => {
      console.log("📡 Calling API...");

      const res = await fetch("/api/truecaller/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessToken, endpoint }),
      });

      console.log("API status:", res.status);

      if (res.ok) {
        console.log("✅ Backend success. Redirecting...");
        router.replace("/privacy"); // or /user
      } else {
        console.log("❌ API failed");
      }
    };

    processTruecaller();
  }, [searchParams, router]);

  return <div>Processing Truecaller login...</div>;
}