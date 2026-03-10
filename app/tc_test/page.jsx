"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Test() {
  const router = useRouter();
  const requestId = crypto.randomUUID();

  useEffect(() => {
    console.log("✅ TC_TEST PAGE MOUNTED");

    // Start polling backend every 2 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/truecaller/status?requestId=${requestId}`,
        );
        const data = await res.json();

        console.log("🔄 Polling backend status:", data);

        if (data.status === "verified") {
          console.log(
            "✅ Truecaller verification complete. Setting session cookie...",
          );

          // ⭐ Set cookie in browser
         // Frontend (polling script)
document.cookie = `truecaller_session=${data.sessionToken}; path=/; max-age=604800`;

          clearInterval(interval);

          console.log("➡️ Redirecting to /user");

          router.push("/user");
        }
      } catch (err) {
        console.log("Polling error:", err);
      }
    }, 2000);

    console.log("🚀 Triggering Truecaller deep link now...");

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
