"use client";

export default function TruecallerLogin() {
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
      "&callbackUrl=https://crud-next-js-beta.vercel.app/tc_success"; // just redirect to a success page
  };

  return (
    <button onClick={start} className="px-4 py-2 bg-green-600 text-white rounded">
      Start Truecaller Login
    </button>
  );
}