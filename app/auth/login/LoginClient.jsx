"use client";

import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginClient() {
  const { status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  /* -----------------------------------
     🔵 Google Login
     NextAuth will redirect automatically
  ------------------------------------*/
  const handleLogin = async () => {
    setLoading(true);

    await signIn("google", {
      callbackUrl: "/user", // ✅ redirect after login
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-100 via-emerald-50 to-amber-50">
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-xl border p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">Welcome back</h1>

        {/* GOOGLE LOGIN */}
        <button
          disabled={loading || status === "loading"}
          onClick={handleLogin}
          className="w-full py-3 rounded-lg bg-emerald-500 text-white font-semibold"
        >
          {loading || status === "loading"
            ? "Signing you in…"
            : "Continue with Google"}
        </button>

        {/* TRUECALLER LOGIN */}
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