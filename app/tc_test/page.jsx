"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function Test() {
  const [requestId, setRequestId] = useState(null);
  const [status, setStatus] = useState("idle"); 
  // idle | waiting | success | failed

  const start = () => {
    const id = crypto.randomUUID();
    setRequestId(id);
    setStatus("waiting");

    window.location =
      "truecallersdk://truesdk/web_verify?type=btmsheet"
      + `&requestNonce=${id}`
      + "&partnerKey=YOUR_KEY"
      + "&partnerName=Taskify%20otpless%20login"
      + "&lang=en"
      + "&privacyUrl=https://your-site.com/privacy"
      + "&termsUrl=https://your-site.com/terms"
      + "&loginPrefix=continue"
      + "&loginSuffix=verifymobile"
      + "&ctaPrefix=continuewith"
      + "&ctaColor=%2300a884"
      + "&ctaTextColor=%23ffffff"
      + "&btnShape=round"
      + "&skipOption=manualdetails"
      + "&ttl=10000";

    pollStatus(id);
  };

  const pollStatus = (id) => {
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;

      const res = await fetch(`/api/truecaller/callback?requestId=${id}`);
      const data = await res.json();

      if (data.verified) {
        clearInterval(interval);
        setStatus("success");

        await signIn("truecaller", {
          profile: JSON.stringify(data.profile),
          callbackUrl: "/user",
        });
      }

      if (attempts >= 5) {
        clearInterval(interval);
        setStatus("failed");
      }
    }, 3000);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={start}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Start Truecaller
      </button>

      {status === "waiting" && (
        <p className="text-yellow-600">
          ⏳ Waiting for Truecaller verification...
        </p>
      )}

      {status === "success" && (
        <p className="text-green-600">
          ✅ Truecaller login successful!
        </p>
      )}

      {status === "failed" && (
        <p className="text-red-600">
          ❌ Truecaller login failed or timed out.
        </p>
      )}
    </div>
  );
}