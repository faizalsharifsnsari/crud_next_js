"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import EditProfileModal from "../components/profile/Editprofiledialuge";
import ChangeAvatarModal from "../components/profile/ChangeAvatarModal";
import Link from "next/link";

function CircleStat({ label, percent, count, color }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative w-24 h-24 rounded-full flex items-center justify-center"
        style={{ background: color }}
      >
        <span className="text-lg font-bold text-gray-800">
          {isNaN(percent) ? 0 : percent}%
        </span>
      </div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-xs text-gray-500">{count} tasks</p>
    </div>
  );
}

export default function ProfilePreview() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);

  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // 🔥 DEBUG STATE
  const [debug, setDebug] = useState({
    step: "init",
    user: null,
    tasks: null,
    error: null,
  });

  // 🔥 DEBUG FETCH
  useEffect(() => {
    console.log("🔥 DEBUG START");

    const runDebug = async () => {
      try {
        // USER FETCH
        setDebug((d) => ({ ...d, step: "fetching /api/user" }));

        const userRes = await fetch("/api/user", {
          credentials: "include",
        });

        const userData = await userRes.json();
        console.log("USER API:", userData);

        setDebug((d) => ({ ...d, user: userData }));

        if (userData.success) {
          setUser(userData.user);
        }

        // TASK FETCH
        setDebug((d) => ({ ...d, step: "fetching /api/products" }));

        const taskRes = await fetch("/api/products", {
          credentials: "include",
        });

        const taskData = await taskRes.json();
        console.log("TASK API:", taskData);

        setDebug((d) => ({
          ...d,
          tasks: taskData,
          step: "done",
        }));

        if (taskData.success) {
          setTasks(taskData.result);
        }
      } catch (err) {
        console.error("DEBUG ERROR:", err);

        setDebug((d) => ({
          ...d,
          error: err.message,
          step: "error",
        }));
      }
    };

    runDebug();
  }, []);

  // ✅ COUNTS
  const statusCount = { notStarted: 0, ongoing: 0, completed: 0 };
  const priorityCount = { high: 0, medium: 0, low: 0 };

  tasks.forEach((task) => {
    if (task.status === "not started") statusCount.notStarted++;
    if (task.status === "ongoing") statusCount.ongoing++;
    if (task.status === "completed") statusCount.completed++;

    if (task.priority === "high") priorityCount.high++;
    if (task.priority === "medium") priorityCount.medium++;
    if (task.priority === "low") priorityCount.low++;
  });

  const getPercent = (value) =>
    tasks.length ? Math.round((value / tasks.length) * 100) : 0;

  // ✅ RECENT ACTIVITY
  const sortedTasks = [...tasks].sort(
    (a, b) =>
      new Date(b.updatedAt || b.createdAt) -
      new Date(a.updatedAt || a.createdAt),
  );

  const recentActivities = sortedTasks.slice(0, 3).map((task) => {
    let text = `➕ Created “${task.title}”`;

    if (task.status === "completed") {
      text = `✔ Completed “${task.title}”`;
    } else if (task.updatedAt !== task.createdAt) {
      text = `✏ Updated “${task.title}”`;
    }

    return {
      text,
      time: task.updatedAt || task.createdAt,
    };
  });

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <main className="min-h-screen bg-green-200 dark:bg-gray-900 pt-20 px-4">
      {/* 🔥 DEBUG PANEL */}
      <div className="bg-black text-green-400 text-xs p-3 mb-4 rounded overflow-auto">
        <p>STEP: {debug.step}</p>
        <p>USER: {JSON.stringify(debug.user)}</p>
        <p>TASKS: {JSON.stringify(debug.tasks)}</p>
        <p>ERROR: {debug.error}</p>
      </div>

      {/* MENU */}
      <div className="fixed top-4 left-4 z-50">
        <div className="bg-red-500 rounded-lg p-1">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
            <div className="w-6 h-0.5 bg-white mb-1"></div>
            <div className="w-6 h-0.5 bg-white mb-1"></div>
            <div className="w-6 h-0.5 bg-white"></div>
          </button>
        </div>

        {menuOpen && (
          <ul className="absolute left-0 mt-3 w-40 bg-white rounded shadow-md">
            <li>
              <Link href="/" className="block px-4 py-2 hover:bg-red-100">
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard"
                className="block px-4 py-2 hover:bg-red-100"
              >
                Profile
              </Link>
            </li>
          </ul>
        )}
      </div>

      {/* PROFILE */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 text-center">
          {user?.image ? (
            <Image
              src={user.image}
              alt="Profile"
              width={80}
              height={80}
              className="rounded-full mx-auto"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
              No Image
            </div>
          )}

          <h2 className="mt-2 font-bold">{user?.name || "No Name"}</h2>
          <p className="text-sm text-gray-500">{user?.email || "No Email"}</p>
        </div>

        <div className="lg:col-span-8 grid sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6">
            <h3 className="mb-4">Task Priority</h3>
            <div className="flex justify-between">
              <CircleStat
                label="High"
                percent={getPercent(priorityCount.high)}
                count={priorityCount.high}
                color="#FEE2E2"
              />
              <CircleStat
                label="Medium"
                percent={getPercent(priorityCount.medium)}
                count={priorityCount.medium}
                color="#FEF3C7"
              />
              <CircleStat
                label="Low"
                percent={getPercent(priorityCount.low)}
                count={priorityCount.low}
                color="#DCFCE7"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <h3 className="mb-4">Task Status</h3>
            <div className="flex justify-between">
              <CircleStat
                label="Completed"
                percent={getPercent(statusCount.completed)}
                count={statusCount.completed}
                color="#DCFCE7"
              />
              <CircleStat
                label="Ongoing"
                percent={getPercent(statusCount.ongoing)}
                count={statusCount.ongoing}
                color="#DBEAFE"
              />
              <CircleStat
                label="Not Started"
                percent={getPercent(statusCount.notStarted)}
                count={statusCount.notStarted}
                color="#E5E7EB"
              />
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/auth/login" })}
        className="w-full py-2 bg-red-600 text-white rounded mt-4"
      >
        Logout
      </button>
    </main>
  );
}
