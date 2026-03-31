"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Test() {
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  // ✅ FIX 1: Stable requestId (never changes)
  const requestIdRef = useRef(crypto.randomUUID());

  useEffect(() => {
    const requestId = requestIdRef.current;

    console.log("✅ TC_TEST PAGE MOUNTED");
    console.log("📌 Request ID:", requestId);

    // ✅ FIX 2: Increase timeout (avoid premature exit)
    const timeout = setTimeout(() => {
      console.log("❌ Timeout. Redirecting home.");
      router.push("/");
    }, 20000);

    let successCount = 0;
    let interval;

    // ✅ FIX 3: Polling function
    const startPolling = () => {
      interval = setInterval(async () => {
        try {
          const res = await fetch(
            `/api/truecaller/status?requestId=${requestId}`
          );
          const data = await res.json();

          console.log("🔄 Polling:", data);

          if (data.status === "verified") {
            successCount++;

            // ✅ FIX 4: Double confirmation (avoid race condition)
            if (successCount >= 2) {
              console.log("✅ VERIFIED (confirmed)");

              clearInterval(interval);
              clearTimeout(timeout);

              // ✅ Save session
              document.cookie = `taskify_session=${data.sessionToken}; path=/; max-age=604800`;

              setVerified(true);

              // Smooth redirect
              setTimeout(() => {
                router.push("/user");
              }, 1500);
            }
          }
        } catch (err) {
          console.log("Polling error:", err);
        }
      }, 2000);
    };

    // ✅ FIX 5: Delay polling (important!)
    setTimeout(startPolling, 1500);

    // ✅ Trigger Truecaller
    console.log("🚀 Triggering Truecaller...");

    window.location.href =
      "truecallersdk://truesdk/web_verify?type=btmsheet" +
      "&requestNonce=" + requestId +
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
      "&ttl=20000"; // ✅ increased TTL

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router]);

  // 🔄 Loading state
  if (!verified) {
    return (
      <main className="min-h-screen bg-green-200 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-700 dark:text-gray-300 text-sm">
          Waiting for Truecaller verification...
        </div>
      </main>
    );
  }

  // ✅ Success UI
  return (
    <main className="min-h-screen flex items-center justify-center bg-green-200 dark:bg-gray-900 px-4">
      <div className="flex flex-col items-center space-y-6">
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