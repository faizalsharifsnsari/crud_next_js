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

  const handleManualRedirect = () => {
    console.log("🧪 Manual button clicked → redirecting to /user");
    router.push("/user");
  };

  return (
    <div>
      <h2>Opening Truecaller...</h2>

      <button
        onClick={handleManualRedirect}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#00a884",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer"
        }}
      >
        Test Redirect to /user
      </button>
    </div>
  );
}