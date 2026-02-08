"use client";

import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Register</h1>

      <button className="bg-blue-500 text-white px-6 py-2 rounded mb-4 hover:bg-blue-600">
        Register with Google
      </button>

      <button className="bg-green-500 text-white px-6 py-2 rounded mb-4 hover:bg-green-600">
        Register with Phone
      </button>

      <p className="mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-500 underline">
          Login
        </Link>
      </p>
    </main>
  );
}
