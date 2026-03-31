"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";
import { CheckIcon, PlayIcon, ClockIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import AddTaskDialog from "./AddTaskdialuge";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
  console.log("User object:", user);
  console.log("User image:", user?.image);

  const [open, setOpen] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <aside className="w-full h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 px-5 py-6 flex flex-col">
      <AddTaskDialog isOpen={open} onClose={() => setOpen(false)} />

      {/* ✅ Profile Section */}
      <div className="flex flex-col items-center text-center">
        {/* 🔥 FIXED IMAGE */}
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 relative">
          {user?.image ? (
            <Image
              src={user.image}
              alt="Profile"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
              N/A
            </div>
          )}
        </div>

        <p className="mt-3 text-base font-semibold text-gray-800 dark:text-white">
          Hello, {user?.name?.split(" ")[0]}
        </p>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-6" />

      {/* ✅ Content */}
      <div className="flex-1 flex flex-col justify-between text-sm text-gray-800 dark:text-gray-200">
        {/* 🔹 Top Section */}
        <div className="space-y-6">
          {/* Task Status */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
              Task Status
            </p>

            <div className="space-y-3">
              {[
                {
                  label: "Not Started",
                  key: "notStarted",
                  status: "not started",
                },
                { label: "Ongoing", key: "ongoing", status: "ongoing" },
                { label: "Completed", key: "completed", status: "completed" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <StatusIcon status={item.status} size="sm" />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-semibold">{statusCount[item.key]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
              Priority
            </p>

            <div className="space-y-3">
              {[
                {
                  label: "High",
                  color: "bg-rose-400",
                  value: priorityCount.high,
                },
                {
                  label: "Medium",
                  color: "bg-amber-400",
                  value: priorityCount.medium,
                },
                {
                  label: "Low",
                  color: "bg-emerald-400",
                  value: priorityCount.low,
                },
              ].map((p) => (
                <div
                  key={p.label}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-sm ${p.color}`} />
                    <span>{p.label}</span>
                  </div>
                  <span className="font-semibold">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 🔹 Bottom Section */}
        <div className="mt-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-2.5 rounded-lg text-sm font-medium 
          text-white bg-blue-500 hover:bg-blue-600 
          transition shadow-sm hover:shadow-md"
          >
            Profile
          </button>
        </div>
      </div>
    </aside>
  );
}
