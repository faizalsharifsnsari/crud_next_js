"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";
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

  const [menuOpen, setMenuOpen] = useState(false);

  // 🔥 DEBUG STATE
  const [debug, setDebug] = useState({
    step: "init",
    userRaw: null,
    taskRaw: null,
    error: null,
  });

  useEffect(() => {
    console.log("🔥 PROFILE DEBUG START");

    const runDebug = async () => {
      try {
        // =========================
        // 🔵 FETCH USER
        // =========================
        setDebug((d) => ({ ...d, step: "Fetching /api/user" }));

        const userRes = await fetch("/api/user", {
          credentials: "include",
        });

        const userData = await userRes.json();

        console.log("🟢 USER API RESPONSE:", userData);

        setDebug((d) => ({ ...d, userRaw: userData }));

        if (userData.success && userData.user) {
          console.log("✅ SETTING USER:", userData.user);
          setUser(userData.user);
        } else {
          console.log("❌ USER NOT FOUND OR INVALID:", userData);
        }

        // =========================
        // 🔵 FETCH TASKS
        // =========================
        setDebug((d) => ({ ...d, step: "Fetching /api/products" }));

        const taskRes = await fetch("/api/products", {
          credentials: "include",
        });

        const taskData = await taskRes.json();

        console.log("🟢 TASK API RESPONSE:", taskData);

        setDebug((d) => ({
          ...d,
          taskRaw: taskData,
          step: "done",
        }));

        if (taskData.success && taskData.result) {
          setTasks(taskData.result);
        } else {
          console.log("❌ TASK FETCH FAILED:", taskData);
        }
      } catch (err) {
        console.error("🔥 DEBUG ERROR:", err);

        setDebug((d) => ({
          ...d,
          error: err.message,
          step: "error",
        }));
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

  const getPercent = (value) =>
    tasks.length ? Math.round((value / tasks.length) * 100) : 0;
  return (
    <main className="min-h-screen bg-green-200 dark:bg-gray-900 relative pt-20 px-4 md:px-6 lg:px-8">
      {/* Hamburger Menu */}
      <div className="fixed top-4 left-4 z-50">
        <div className="bg-red-500 dark:bg-red-500 backdrop-blur-md shadow-md rounded-lg p-1 border border-red-600">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded hover:bg-red-600"
            aria-label="Menu"
          >
            <div className="w-6 h-0.5 bg-white mb-1"></div>
            <div className="w-6 h-0.5 bg-white mb-1"></div>
            <div className="w-6 h-0.5 bg-white"></div>
          </button>
        </div>

        {menuOpen && (
          <ul className="absolute left-0 mt-3 w-40 bg-white dark:bg-gray-800 border border-red-200 dark:border-gray-700 rounded shadow-md">
            <li>
              <Link
                href="/"
                className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-red-100 dark:hover:bg-gray-700"
                onClick={() => setMenuOpen(false)}
              >
                Go to Home
              </Link>
            </li>

            <li>
              <Link
                href="/dashboard"
                className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-red-100 dark:hover:bg-gray-700"
                onClick={() => setMenuOpen(false)}
              >
                Go to Profile
              </Link>
            </li>
          </ul>
        )}
      </div>

      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-2xl shadow p-5 md:p-6 border border-red-200 dark:border-gray-700">
          <div className="flex flex-col items-center text-center">
            {user?.image && user.image.trim() !== "" ? (
              <Image
                src={user.image}
                alt="Profile"
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-xs">
                No Image
              </div>
            )}

            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-2">
              {user?.name}
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 break-all">
              {user?.email}
            </p>

            <div className="mt-4 text-xs text-gray-400">
              Member since • Jan 2024
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 md:p-6 border border-red-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-4">
              Task Priority
            </h3>

            <div className="flex flex-wrap justify-between gap-4">
              <CircleStat
                label="High"
                percent={Math.round((priorityCount.high / tasks.length) * 100)}
                count={priorityCount.high}
                color="#FEE2E2"
              />
              <CircleStat
                label="Medium"
                percent={Math.round(
                  (priorityCount.medium / tasks.length) * 100,
                )}
                count={priorityCount.medium}
                color="#FEF3C7"
              />
              <CircleStat
                label="Low"
                percent={Math.round((priorityCount.low / tasks.length) * 100)}
                count={priorityCount.low}
                color="#DCFCE7"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 md:p-6 border border-red-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-4">
              Task Status
            </h3>

            <div className="flex flex-wrap justify-between gap-4">
              <CircleStat
                label="Completed"
                percent={Math.round(
                  (statusCount.completed / tasks.length) * 100,
                )}
                count={statusCount.completed}
                color="#DCFCE7"
              />
              <CircleStat
                label="Ongoing"
                percent={Math.round((statusCount.ongoing / tasks.length) * 100)}
                count={statusCount.ongoing}
                color="#DBEAFE"
              />
              <CircleStat
                label="Not Started"
                percent={Math.round(
                  (statusCount.notStarted / tasks.length) * 100,
                )}
                count={statusCount.notStarted}
                color="#E5E7EB"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Activity + Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Activity */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-2xl shadow p-5 md:p-6 border border-red-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Recent Activity
          </h3>

          <ul className="space-y-4 text-sm">
            {recentActivities.length === 0 ? (
              <li className="text-gray-400">No recent activity</li>
            ) : (
              recentActivities.map((activity, index) => (
                <li
                  key={index}
                  className="flex justify-between text-gray-700 dark:text-gray-300"
                >
                  <span>{activity.text}</span>
                  <span className="text-gray-400">
                    {timeAgo(activity.time)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Settings */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-2xl shadow p-5 md:p-6 border border-red-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Account Settings
          </h3>

          <div className="space-y-3">
            <button
              className="w-full py-2 rounded-lg border border-red-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-gray-700"
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Profile
            </button>

            <button
              className="w-full py-2 rounded-lg border border-red-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-gray-700"
              onClick={() => setIsAvatarOpen(true)}
            >
              Change Avatar
            </button>

            {/* DARK RED LOGOUT */}
            <button
              className="w-full py-2 rounded-lg text-sm bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800 transition"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Logout
            </button>
          </div>

          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            user={user}
            onSave={handleNameSave}
          />

          <ChangeAvatarModal
            isOpen={isAvatarOpen}
            onClose={() => setIsAvatarOpen(false)}
            user={user}
            onSave={async (newImageUrl) => {
              try {
                const res = await fetch("/api/user", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ image: newImageUrl }),
                });

                const data = await res.json();

                if (data.success) setUser(data.user);
                else alert("Failed to update avatar");
              } catch (err) {
                console.error(err);
                alert("Something went wrong");
              }

              setIsAvatarOpen(false);
            }}
          />
        </div>
      </div>
    </main>
  );
}
