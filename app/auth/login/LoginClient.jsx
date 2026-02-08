"use client";



import { signIn } from "next-auth/react";

export default function LoginClient() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4
      bg-gradient-to-br from-emerald-100 via-emerald-50 to-amber-50
    ">
      <div className="
        w-full max-w-md
        rounded-2xl
        bg-white/90 backdrop-blur
        shadow-2xl
        border border-emerald-200
      ">
        {/* Header */}
        <div className="px-6 py-6 text-center border-b border-emerald-100">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Sign in to continue to <span className="font-semibold">Taskify</span>
          </p>

          {/* Accent bar */}
          <div className="mt-4 flex justify-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-rose-300" />
            <span className="w-3 h-3 rounded-sm bg-amber-300" />
            <span className="w-3 h-3 rounded-sm bg-emerald-300" />
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          {/* Google */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/user" })}
            className="
              w-full py-3 rounded-lg
              bg-emerald-500 text-white
              font-semibold text-sm
              hover:bg-emerald-600
              active:scale-[0.98]
              transition
              shadow-md
            "
          >
            Continue with Google
          </button>

          {/* Phone (disabled) */}
          <button
            disabled
            className="
              w-full py-3 rounded-lg
              bg-amber-100
              text-amber-700 text-sm font-medium
              cursor-not-allowed
            "
          >
            Continue with Phone
          </button>
        </div>

       
      </div>
    </main>
  );
}
