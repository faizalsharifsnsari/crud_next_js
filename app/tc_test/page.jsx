"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Test() {
  const router = useRouter();

  useEffect(() => {

    const requestId = crypto.randomUUID();

    console.log("RequestId:", requestId);

    const interval = setInterval(async () => {
      try {

        const res = await fetch(
          `/api/truecaller/status?requestId=${requestId}`
        );

        const data = await res.json();

        console.log("Polling:", data);

        if (data.status === "verified") {

          clearInterval(interval);

          console.log("Phone verified:", data.phone);

          // ⭐ call login API
          const loginRes = await fetch("/api/truecaller/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              phone: data.phone,
            }),
          });

          const loginData = await loginRes.json();

          if (loginData.success) {

            console.log("Login successful");

            router.push("/user");

          }
        }

      } catch (error) {
        console.log("Polling error:", error);
      }

    }, 2000);

    console.log("Launching Truecaller...");

    window.location.href =
      "truecallersdk://truesdk/web_verify?type=btmsheet" +
      "&requestNonce=" + requestId +
      "&partnerKey=YOUR_PARTNER_KEY" +
      "&partnerName=Taskify%20Login" +
      "&lang=en" +
      "&privacyUrl=https://yourdomain.com/privacy" +
      "&termsUrl=https://yourdomain.com/terms" +
      "&redirectUrl=https://yourdomain.com/truecaller_response" +
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

  return <div>Opening Truecaller...</div>;
}