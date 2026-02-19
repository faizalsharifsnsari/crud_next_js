"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthDialog from "../../components/AuthDialog";

export default function LoginClient() {
  const { status } = useSession(); // 👈 key change
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(null);

  //truecaller api integration
  const handleTruecallerLogin = () => {
  const requestNonce = crypto.randomUUID();
  const appKey = process.env.NEXT_PUBLIC_TRUECALLER_APP_KEY;
  const appName = "Taskify otpless login";

  const deepLink = `truecallersdk://truesdk/web_verify?
    type=btmsheet
    &requestNonce=${requestNonce}
    &partnerKey=${appKey}
    &partnerName=${encodeURIComponent(appName)}
    &lang=en
    &privacyUrl=https://crud-next-js-beta.vercel.app/privacy
    &termsUrl=https://crud-next-js-beta.vercel.app/terms
    &loginPrefix=getstarted
    &loginSuffix=login
    &ctaPrefix=continuewith
    &ctaColor=%2300a884
    &ctaTextColor=%23ffffff
    &btnShape=round
    &skipOption=manualdetails
    &ttl=10000`;

  window.location.href = deepLink.replace(/\s+/g, "");

  setTimeout(function () {
    if (document.hasFocus()) {
      // Truecaller NOT installed
      console.log("Truecaller app not installed");
    } else {
      // Truecaller installed
      console.log("Truecaller flow started");
    }
  }, 600);
};


  /* ------------------------------
     🔐 Start Google login
  --------------------------------*/
  const handleLogin = () => {
    setLoading(true);
    signIn("google"); // 🚀 OAuth redirect happens here
  };

  return (
    <main
      className="relative min-h-screen flex items-center justify-center px-4
      bg-gradient-to-br from-emerald-100 via-emerald-50 to-amber-50
    "
    >
      {/* Glass blur when dialog is visible */}
      <div
        className={`absolute inset-0 transition-all duration-300
          ${dialog ? "backdrop-blur-md bg-black/30 z-40" : ""}
        `}
      />

      {/* Dialog */}
      {dialog && (
        <AuthDialog
          type={dialog.type}
          message={dialog.message}
          onAction={
            dialog.type === "error" ? () => window.location.reload() : null
          }
        />
      )}

      {/* Login Card */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl
        bg-white/90 backdrop-blur-xl
        shadow-2xl border border-emerald-200
      "
      >
        {/* Header */}
        <div className="px-6 py-6 text-center border-b border-emerald-100">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-600 mt-1">
            Sign in to continue to{" "}
            <span className="font-semibold">Taskify</span>
          </p>

          <div className="mt-4 flex justify-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-rose-300" />
            <span className="w-3 h-3 rounded-sm bg-amber-300" />
            <span className="w-3 h-3 rounded-sm bg-emerald-300" />
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          <button
            disabled={loading || status === "loading"}
            onClick={handleLogin}
            className="w-full py-3 rounded-lg
              bg-emerald-500 text-white
              font-semibold text-sm
              hover:bg-emerald-600
              active:scale-[0.98]
              transition shadow-md
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {loading || status === "loading"
              ? "Signing you in…"
              : "Continue with Google"}
          </button>

          <button
            onClick={handleTruecallerLogin}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold"
          >
            Continue with Truecaller
          </button>
        </div>
      </div>
    </main>
  );
}
