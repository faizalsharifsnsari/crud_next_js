"use client";

export default function Test() {
  const start = () => {
    const id = crypto.randomUUID();

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
  };

  return (
    <button
      onClick={start}
      className="px-4 py-2 bg-green-600 text-white rounded"
    >
      Start Truecaller
    </button>
  );
}