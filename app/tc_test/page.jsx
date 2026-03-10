"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TcTest() {
  const router = useRouter();
  const requestId = crypto.randomUUID();

  useEffect(() => {
    // Poll backend every 2s for Truecaller verification
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/truecaller/status?requestId=${requestId}`);
        const data = await res.json();
        console.log("🔄 Polling backend status:", data);

        if (data.status === "verified") {
          console.log("✅ Truecaller verification complete.");

          // Set cookie globally for demo
          document.cookie = `truecaller_session=${data.sessionToken}; path=/; max-age=604800`;

          clearInterval(interval);
          router.push("/user");
        }
      } catch (err) {
        console.log("Polling error:", err);
      }
    }, 2000);

    // Trigger Truecaller deep link
    window.location.href =
      "truecallersdk://truesdk/web_verify?type=btmsheet" +
      "&requestNonce=" +
      requestId +
      "&partnerKey=p6Zcx4868bc93774f4d97977dd3642db09e60" +
      "&partnerName=Taskify%20otpless%20login" +
      "&lang=en" +
      "&privacyUrl=https://crud-next-js-beta.vercel.app/privacy" +
      "&termsUrl=https://crud-next-js-beta.vercel.app/terms" +
      "&redirectUrl=https://crud-next-js-beta.vercel.app/truecaller_response" +
      "&loginPrefix=continue" +
      "&loginSuffix=verifymobile" +
      "&ctaPrefix=continuewith" +
      "&ctaColor=%2300a884" +
      "&ctaTextColor=%23ffffff" +
      "&btnShape=round" +
      "&skipOption=manualdetails" +
      "&ttl=10000";

    return () => clearInterval(interval);
  }, [router]);
}