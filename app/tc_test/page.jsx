"use client";
export const dynamic = "force-dynamic"; // prevent prerender

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

function TruecallerLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const endpoint = searchParams.get("endpoint");

    if (accessToken && endpoint) {
      (async () => {
        try {
          const res = await fetch("/api/truecaller/callback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken, endpoint }),
          });

          const data = await res.json();

          if (data.success && data.userId) {
            await signIn("truecaller", {
              userId: data.userId,
              redirect: true,
              callbackUrl: "/",
            });
          } else {
            console.error("Truecaller callback failed:", data);
          }
        } catch (err) {
          console.error("Error calling Truecaller backend:", err);
        }
      })();
    }
  }, [searchParams]);

  const start = () => {
    window.location =
      "truecallersdk://truesdk/web_verify?type=btmsheet" +
      "&requestNonce=12345678" +
      "&partnerKey=p6Zcx4868bc93774f4d97977dd3642db09e60" +
      "&partnerName=Taskify%20otpless%20login" +
      "&lang=en" +
      "&privacyUrl=https://crud-next-js-beta.vercel.app/privacy" +
      "&termsUrl=https://crud-next-js-beta.vercel.app/terms" +
      "&loginPrefix=continue" +
      "&loginSuffix=verifymobile" +
      "&ctaPrefix=continuewith" +
      "&ctaColor=%2300a884" +
      "&ctaTextColor=%23ffffff" +
      "&btnShape=round" +
      "&skipOption=manualdetails" +
      "&ttl=10000" +
      "&callbackUrl=https://crud-next-js-beta.vercel.app/tc_test";
  };

  return (
    <button
      onClick={start}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      Start Truecaller Login
    </button>
  );
}

export default function TruecallerLogin() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TruecallerLoginInner />
    </Suspense>
  );
}