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
    document.cookie = "taskify_session=; path=/; max-age=0";

    await signIn("google", {
      callbackUrl: "/user", // ✅ redirect after login
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-green-200 dark:bg-gray-900">
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-xl border dark:border-gray-700 p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Welcome back
        </h1>

        {/* GOOGLE LOGIN */}
        <button
          disabled={loading || status === "loading"}
          onClick={handleLogin}
          className="w-full py-3 rounded-lg bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold transition"
        >
          {loading || status === "loading"
            ? "Signing you in…"
            : "Continue with Google"}
        </button>

        {/* TRUECALLER LOGIN */}
        <button
          onClick={() => router.push("/tc_test")}
          className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold transition"
        >
          Continue with Truecaller
        </button>
      </div>
    </main>
  );
}
