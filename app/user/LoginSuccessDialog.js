"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginFlow({ onDone }) {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const fromLogin = searchParams.get("from") === "login";
  const [showDialog, setShowDialog] = useState(false);

  // 🔐 runs only once
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;

    if (status === "authenticated" && fromLogin) {
      hasRun.current = true;
      setShowDialog(true);

      const timer = setTimeout(() => {
        setShowDialog(false);
        router.replace("/user"); // remove query
        onDone(); // show home UI
      }, 1200);

      return () => clearTimeout(timer);
    }

    // direct visit → show UI immediately
    if (status === "authenticated" && !fromLogin) {
      hasRun.current = true;
      onDone();
    }
  }, [status, fromLogin, router, onDone]);

  if (!showDialog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="rounded-lg bg-white px-6 py-4 shadow-lg">
        <p className="text-lg font-semibold text-green-600">
          Login successful ✅
        </p>
      </div>
    </div>
  );
}
