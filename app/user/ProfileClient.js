"use client";

import { useState } from "react";
import LoginFlow from "./LoginSuccessDialog";

export default function ProfileClient({ sidebar, content }) {
  const [ready, setReady] = useState(false);

  return (
    <main className="relative min-h-screen">
      {/* Login success dialog gate */}
      <LoginFlow onDone={() => setReady(true)} />

      {/* App layout */}
      <div
        className={`flex min-h-screen transition-opacity duration-300 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Sidebar */}
        <aside className="shrink-0">
          {sidebar}
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {content}
        </div>
      </div>
    </main>
  );
}
