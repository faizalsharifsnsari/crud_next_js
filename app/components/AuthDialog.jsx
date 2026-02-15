"use client";

import { useEffect, useState } from "react";
import AuthDialog from "../components/AuthDialog";

export default function LoginSuccessDialog({ onDone }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasShown = sessionStorage.getItem("loginSuccessShown");

    if (!hasShown) {
      setShow(true);
      sessionStorage.setItem("loginSuccessShown", "true");

      setTimeout(() => {
        setShow(false);
        onDone?.(); // ✅ tell parent we’re done
      }, 1200);
    } else {
      onDone?.(); // no dialog → allow UI immediately
    }
  }, [onDone]);

  if (!show) return null;

  return (
    <AuthDialog
      type="success"
      message="Login successful. Welcome back 👋"
    />
  );
}
