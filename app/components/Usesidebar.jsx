"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";
import { CheckIcon, PlayIcon, ClockIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import AddTaskDialog from "./AddTaskdialuge"
import { useState } from "react";
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
  const [open,setOpen] = useState(false);
  

  const [menuOpen, setMenuOpen] = useState(false);
  

  return (
    <aside className="w-72 bg-white border-r px-5 py-6 flex flex-col relative">
      {/* Hamburger Menu at Top-Left */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded hover:bg-gray-100"
          aria-label="Menu"
        >
          {/* Simple 3-line hamburger icon */}
          <div className="w-6 h-0.5 bg-gray-800 mb-1"></div>
          <div className="w-6 h-0.5 bg-gray-800 mb-1"></div>
          <div className="w-6 h-0.5 bg-gray-800"></div>
        </button>

        {menuOpen && (
          <ul className="absolute left-0 mt-2 w-40 bg-white border rounded shadow-md z-50">
            <li>
              <Link
                href="/"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                Go to Home
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                Go to Profile
              </Link>
            </li>
          </ul>
        )}
      </div>

      {/* Add Task Dialog */}
      <AddTaskDialog isOpen={open} onClose={() => setOpen(false)} />

      {/* Profile Section */}
      <div className="flex flex-col items-center text-center mt-10">
        {user?.image && (
          <Image
            src={user.image}
            alt="Profile"
            width={80}
            height={80}
            className="rounded-full object-cover"
          />
        )}

        <p className="mt-3 text-lg font-extrabold tracking-wide text-emerald-600 font-serif">
          Hello Mr. {user?.name?.split(" ")[0]}!!!
        </p>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gray-200 my-6" />

      {/* Status & Priority Counters */}
      <div className="space-y-6 text-sm flex-1 flex flex-col">
        {/* Task Status */}
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

        {/* Priority */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
            Priority
          </p>
          <div className="space-y-3 flex-1 flex flex-col justify-end">
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

            {/* Add Task Button */}
            <div className="mt-6">
              <button
                onClick={() => setOpen(true)}
                className="w-full py-2.5 rounded-md text-sm font-medium text-gray-800 border border-gray-300 bg-white hover:bg-black/5 transition"
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
