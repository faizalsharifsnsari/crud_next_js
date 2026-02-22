"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";

export default function LoginClient() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [isTruecallerFlow, setIsTruecallerFlow] = useState(false);
  
  /* -----------------------------------
     🔐 Redirect ONLY when authenticated
  ------------------------------------*/
  useEffect(() => {
    if (status === "authenticated" && !isTruecallerFlow) {
      router.push("/user?from=login");
    }
  }, [status, isTruecallerFlow, router]);


 

  /* -----------------------------------
     🔵 Google Login
  ------------------------------------*/
  const handleLogin = () => {
    setLoading(true);
    signIn("google");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-100 via-emerald-50 to-amber-50">
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-xl border p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">Welcome back</h1>

        <button
          disabled={loading || status === "loading"}
          onClick={handleLogin}
          className="w-full py-3 rounded-lg bg-emerald-500 text-white font-semibold"
        >
          {loading || status === "loading"
            ? "Signing you in…"
            : "Continue with Google"}
        </button>

        <button
          onClick={() => router.push("/tc_test")}
          className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold"
        >
          Continue with Truecaller
        </button>
        
     
      </div>
    </main>
  );
}
