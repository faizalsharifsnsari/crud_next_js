"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function Test() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle redirect after Truecaller callback
  useEffect(() => {
    const userId = searchParams.get("userId");
    if (userId) {
      // Sign in the user via NextAuth
      signIn("truecaller", {
        userId,
        redirect: true,
        callbackUrl: "/",
      });
    }
  }, [searchParams]);

  const start = () => {
    // Open Truecaller SDK deep link
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
      // 🔥 Add callback URL so Truecaller redirects back to browser
      "&callbackUrl=https://crud-next-js-beta.vercel.app/tc-success";
  };

  return <button onClick={start}>Start Truecaller</button>;
}