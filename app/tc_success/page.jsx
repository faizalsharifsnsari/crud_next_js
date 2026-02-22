"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function TruecallerSuccess() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const endpoint = searchParams.get("endpoint");

    if (!accessToken || !endpoint) {
      console.error("Missing accessToken or endpoint in query params");
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/truecaller/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken, endpoint }),
        });

        const data = await res.json();

        if (data.success && data.redirectUrl) {
          // 🔥 Redirect to NextAuth to create session
          window.location.href = data.redirectUrl;
        } else {
          console.error("Truecaller callback failed:", data);
        }
      } catch (err) {
        console.error("Error calling Truecaller backend:", err);
      }
    })();
  }, [searchParams]);

  return <div>Processing Truecaller login...</div>;
}