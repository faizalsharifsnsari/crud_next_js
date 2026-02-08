"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";
import { CheckIcon, PlayIcon, ClockIcon } from "@heroicons/react/24/solid";
import { redirect } from "next/navigation";

/* 🔹 Status Icon (reused everywhere) */
function StatusIcon({ status, size = "md" }) {
  const sizeClasses = size === "sm" ? "w-6 h-6" : "w-9 h-9";

  const base = `${sizeClasses} rounded-full flex items-center justify-center shadow-sm`;

  if (status === "completed") {
    return (
      <div className={`${base} bg-green-500 text-white`} title="Completed">
        <CheckIcon className={size === "sm" ? "w-4 h-4" : "w-5 h-5"} />
      </div>
    );
  }

  if (status === "ongoing") {
    return (
      <div className={`${base} bg-blue-500 text-white`} title="Ongoing">
        <PlayIcon
          className={`${size === "sm" ? "w-4 h-4" : "w-5 h-5"} ml-[1px]`}
        />
      </div>
    );
  }

  return (
    <div className={`${base} bg-gray-400 text-white`} title="Not started">
      <ClockIcon className={size === "sm" ? "w-4 h-4" : "w-5 h-5"} />
    </div>
  );
}

export default function UserSidebar({ user, statusCount, priorityCount }) {
  return (
    <aside className="w-72 bg-white border-r px-5 py-6 flex flex-col">
      {/* Profile */}
      <div className="flex flex-col items-center text-center">
        {user?.image && (
          <Image
            src={user.image}
            alt="Profile"
            width={80}
            height={80}
            className="rounded-full object-cover"
          />
        )}

        <p className="mt-3 font-semibold text-gray-900">{user.name}</p>

        <p className="text-xs text-gray-500 break-all">{user.email}</p>

        {/* Logout */}
        <button
          onClick={() => signOut()}
          className="
            mt-4 px-4 py-2 text-sm font-medium
            rounded-md border border-red-500
            text-red-500
            hover:bg-red-50
            transition
          "
        >
          Logout
        </button>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gray-200 my-6" />

      {/* Status Counters */}
      <div className="space-y-6 text-sm">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
            Task Status
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusIcon status="not started" size="sm" />
                <span>Not Started</span>
              </div>
              <span className="font-semibold">{statusCount.notStarted}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusIcon status="ongoing" size="sm" />
                <span>Ongoing</span>
              </div>
              <span className="font-semibold">{statusCount.ongoing}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusIcon status="completed" size="sm" />
                <span>Completed</span>
              </div>
              <span className="font-semibold">{statusCount.completed}</span>
            </div>
          </div>
        </div>

        {/* Priority Counters */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
            Priority
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-sm bg-rose-300" />
                <span>High</span>
              </div>
              <span className="font-semibold">{priorityCount.high}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-sm bg-amber-300" />
                <span>Medium</span>
              </div>
              <span className="font-semibold">{priorityCount.medium}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-sm bg-emerald-300" />
                <span>Low</span>
              </div>
              <span className="font-semibold">{priorityCount.low}</span>
            </div>

            {/* Bottom action */}
            <div className="mt-auto pt-6">
              <button
                onClick={() => redirect("/dashboard")}
                className="
          w-full py-2.5
          rounded-md
          text-sm font-medium
          text-gray-800
          border border-gray-300
          bg-white
          hover:bg-black/5
          transition
        "
              >
                + Add Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
