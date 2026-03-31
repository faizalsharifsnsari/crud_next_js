"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  HomeIcon,
  CheckIcon,
  PlayIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Missing states added
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);

  // =========================
  // 🔵 FETCH DATA
  // =========================
  useEffect(() => {
    const runDebug = async () => {
      try {
        setLoading(true);

        // 🔥 Try cached data first (instant UI)
        const cachedUser = localStorage.getItem("user");
        const cachedTasks = localStorage.getItem("tasks");

        if (cachedUser) setUser(JSON.parse(cachedUser));
        if (cachedTasks) setTasks(JSON.parse(cachedTasks));

        // 🔥 Fetch fresh data
        const [userRes, taskRes] = await Promise.all([
          fetch("/api/user", { credentials: "include" }),
          fetch("/api/products", { credentials: "include" }),
        ]);

        const userData = await userRes.json();
        const taskData = await taskRes.json();

        if (userData.success && userData.user) {
          setUser(userData.user);
          localStorage.setItem("user", JSON.stringify(userData.user));
        }

        if (taskData.success && taskData.result) {
          setTasks(taskData.result);
          localStorage.setItem("tasks", JSON.stringify(taskData.result));
        }
      } catch (err) {
        console.error("🔥 ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    runDebug();
  }, []);

  // =========================
  // 📊 COUNTS
  // =========================
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

  // ✅ Safe percent function
  const getPercent = (value) =>
    tasks.length ? Math.round((value / tasks.length) * 100) : 0;

  // =========================
  // 🕒 TIME AGO HELPER
  // =========================
  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);

    if (diff < 60) return "just now";
    if (diff < 3600) return Math.floor(diff / 60) + " min ago";
    if (diff < 86400) return Math.floor(diff / 3600) + " hrs ago";
    return Math.floor(diff / 86400) + " days ago";
  };

  // =========================
  // 🔥 RECENT ACTIVITY (FIXED)
  // =========================
  const recentActivities = tasks.slice(0, 5).map((task) => ({
    text: `${task.title} (${task.status})`,
    time: task.createdAt || new Date(),
  }));

  //for updating the username
  const handleNameSave = async (newName) => {
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName }),
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        setIsEditModalOpen(false);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };
  //for the navigation
  const router = useRouter();
  //icon code
  function StatusIcon({ status, onClick }) {
    const base =
      "w-9 h-9 rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition";

    if (status === "completed") {
      return (
        <div
          onClick={onClick}
          className={`${base} bg-green-500 text-white`}
          title="Completed - click to view"
        >
          <CheckIcon className="w-5 h-5" />
        </div>
      );
    }

    if (status === "ongoing") {
      return (
        <div
          onClick={onClick}
          className={`${base} bg-blue-500 text-white`}
          title="Ongoing - click to view"
        >
          <PlayIcon className="w-5 h-5 ml-[1px]" />
        </div>
      );
    }

    return (
      <div
        onClick={onClick}
        className={`${base} bg-gray-400 text-white`}
        title="Not started - click to view"
      >
        <ClockIcon className="w-5 h-5" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-green-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* 🔙 HOME BUTTON */}
      <button
        onClick={() => router.push("/user")}
        className="absolute left-4 top-4 z-10 
             bg-white/80 dark:bg-gray-800/80 backdrop-blur-md 
             p-2 rounded-full shadow 
             hover:scale-105 transition"
      >
        <HomeIcon className="w-5 h-5 text-gray-800 dark:text-white" />
      </button>
      <div className="pt-16 pb-6 px-4 text-center bg-green-200 dark:bg-gray-900 rounded-b-3xl shadow-md">
        {user?.image ? (
          <Image
            src={user.image}
            alt="Profile"
            width={90}
            height={90}
            className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white dark:border-gray-800"
          />
        ) : (
          <div className="w-24 h-24 bg-green-300 dark:bg-gray-700 rounded-full mx-auto flex items-center justify-center">
            No Image
          </div>
        )}

        <div className="mt-4 space-y-1 text-center">
          <p className="text-sm">
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              Name:
            </span>{" "}
            <span className="text-gray-900 dark:text-white font-semibold">
              {user?.name || "No Name"}
            </span>
          </p>

          <p className="text-sm">
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              Email:
            </span>{" "}
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {user?.email || "No Email"}
            </span>
          </p>
        </div>
      </div>

      {/* 🔹 CONTENT */}
      <div className="px-4 mt-6 space-y-6">
        {/* 📊 TASK SUMMARY */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-md">
          <h3 className="font-semibold mb-3">Task Summary</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>🔴 High Priority</span>
              <span>{priorityCount.high}</span>
            </div>
            <div className="flex justify-between">
              <span>🟡 Medium Priority</span>
              <span>{priorityCount.medium}</span>
            </div>
            <div className="flex justify-between">
              <span>🟢 Low Priority</span>
              <span>{priorityCount.low}</span>
            </div>
          </div>
        </div>

        {/* 📌 STATUS */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-md">
          <h3 className="font-semibold mb-3">Task Status</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>✅ Completed</span>
              <span>{statusCount.completed}</span>
            </div>
            <div className="flex justify-between">
              <span>⏳ Ongoing</span>
              <span>{statusCount.ongoing}</span>
            </div>
            <div className="flex justify-between">
              <span>📝 Not Started</span>
              <span>{statusCount.notStarted}</span>
            </div>
          </div>
        </div>

        {/* 🕒 RECENT ACTIVITY */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-md">
          <h3 className="font-semibold mb-3">Recent Activity</h3>

          {recentActivities.length === 0 ? (
            <p className="text-gray-400 text-sm">No recent activity</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recentActivities.map((activity, index) => (
                <li key={index} className="flex justify-between">
                  <span className="truncate">{activity.text}</span>
                  <span className="text-gray-400 text-xs">
                    {timeAgo(activity.time)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ⚙️ SETTINGS */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-md">
          <h3 className="font-semibold mb-3">Account Settings</h3>

          <div className="space-y-3">
            <button
              className="w-full py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Profile
            </button>

            <button
              className="w-full py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsAvatarOpen(true)}
            >
              Change Avatar
            </button>

            <button
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
