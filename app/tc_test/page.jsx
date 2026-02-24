"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Test() {
  const router = useRouter();

  useEffect(() => {
    console.log("✅ TC_TEST PAGE MOUNTED");
    console.log("Initial visibility state:", document.visibilityState);

    const handleVisibilityChange = () => {
      console.log("👀 Visibility changed!");
      console.log("Current visibility state:", document.visibilityState);
      console.log("Current URL:", window.location.href);

      if (document.visibilityState === "hidden") {
        console.log("📱 User left browser (probably opened Truecaller)");
      }

      if (document.visibilityState === "visible") {
        console.log("🔙 User returned to browser from Truecaller");
        console.log("➡ Redirecting to /user in 2 seconds...");
        setTimeout(() => {
          router.replace("/user");
        }, 2000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    console.log("🚀 Triggering Truecaller deep link now...");

    window.location.href =
      "truecallersdk://truesdk/web_verify?type=btmsheet" +
      "&requestNonce=12345678" +
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

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  return <div>Opening Truecaller...</div>;
}