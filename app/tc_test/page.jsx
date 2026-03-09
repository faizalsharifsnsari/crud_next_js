"use client";

import { useEffect } from "react";

export default function Test() {

  useEffect(() => {

    console.log("🚀 Triggering Truecaller deep link...");

    const requestId = crypto.randomUUID();

    window.location.href =
      "truecallersdk://truesdk/web_verify?type=btmsheet" +
      "&requestNonce=" + requestId +
      "&partnerKey=p6Zcx4868bc93774f4d97977dd3642db09e60" +
      "&partnerName=Taskify%20login" +
      "&lang=en" +
      "&privacyUrl=https://crud-next-js-beta.vercel.app/privacy" +
      "&termsUrl=https://crud-next-js-beta.vercel.app/terms" +
      "&redirectUrl=https://crud-next-js-beta.vercel.app/api/truecaller/callback" +
      "&loginPrefix=continue" +
      "&loginSuffix=verifymobile" +
      "&ctaPrefix=continuewith" +
      "&ctaColor=%2300a884" +
      "&ctaTextColor=%23ffffff" +
      "&btnShape=round" +
      "&skipOption=manualdetails" +
      "&ttl=10000";

  }, []);

  return (
    <div style={{textAlign:"center", marginTop:"100px"}}>
      <h2>Redirecting to Truecaller...</h2>
    </div>
  );
}