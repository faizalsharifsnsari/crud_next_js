"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Test() {
  const router = useRouter();

  const [verified, setVerified] = useState(false);
  const requestId = crypto.randomUUID();

  useEffect(() => {
    console.log("✅ TC_TEST PAGE MOUNTED");

    // Redirect if user never opened Truecaller
    const timeout = setTimeout(() => {
      console.log("❌ Truecaller not opened. Redirecting home.");
      router.push("/");
    }, 12000);

    // Poll backend
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/truecaller/status?requestId=${requestId}`,
        );
        const data = await res.json();

        console.log("🔄 Polling backend status:", data);

        if (data.status === "verified") {
          console.log("✅ Truecaller verification complete");

          clearTimeout(timeout);
          clearInterval(interval);

          document.cookie = `taskify_session=${data.sessionToken}; path=/; max-age=604800`;

          setVerified(true);

          setTimeout(() => {
            router.push("/user");
          }, 2000);
        }
      } catch (err) {
        console.log("Polling error:", err);
      }
    }, 2000);

    console.log("🚀 Triggering Truecaller deep link...");

    window.location.href = s;
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

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router, requestId]);

  if (!verified) {
    return <main className="min-h-screen bg-green-200 dark:bg-gray-900"></main>;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-green-200 dark:bg-gray-900 px-4">
      <div className="flex flex-col items-center space-y-6">
        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>

        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Verification successful
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    </main>
  );
}
