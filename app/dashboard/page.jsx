"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import ChangeAvatarModal from "../components/profile/ChangeAvatarModal";
import EditProfileModal from "../components/profile/Editprofiledialuge";

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

  // ✅ Missing states added
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);

  // =========================
  // 🔵 FETCH DATA
  // =========================
  useEffect(() => {
    const runDebug = async () => {
      try {
        const userRes = await fetch("/api/user", {
          credentials: "include",
        });
        const userData = await userRes.json();

        if (userData.success && userData.user) {
          setUser(userData.user);
        }

        const taskRes = await fetch("/api/products", {
          credentials: "include",
        });
        const taskData = await taskRes.json();

        if (taskData.success && taskData.result) {
          setTasks(taskData.result);
        }
      } catch (err) {
        console.error("🔥 ERROR:", err);
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

  return (
    <main className="h-screen bg-green-200 dark:bg-gray-950 text-gray-900 dark:text-gray-100 relative">
      {/* 🔥 SCROLLABLE CONTENT */}
      <div className="h-[80vh] overflow-y-auto pt-20 px-4 md:px-6 lg:px-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Profile */}
          <div className="lg:col-span-4 bg-white dark:bg-gray-900 rounded-2xl shadow-md dark:shadow-black/40 p-6 text-center border border-gray-200 dark:border-gray-700">
            {user?.image ? (
              <Image
                src={user.image}
                alt="Profile"
                width={80}
                height={80}
                className="rounded-full mx-auto"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto flex items-center justify-center text-sm">
                No Image
              </div>
            )}

            <h2 className="mt-2 font-bold">{user?.name || "No Name"}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user?.email || "No Email"}
            </p>
          </div>

          {/* Stats */}
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md dark:shadow-black/40 p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="mb-4 font-semibold">Task Priority</h3>
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

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md dark:shadow-black/40 p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="mb-4 font-semibold">Task Status</h3>
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

        {/* Activity + Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Activity */}
          <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-2xl shadow-md dark:shadow-black/40 p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

            <ul className="space-y-3 text-sm">
              {recentActivities.length === 0 ? (
                <li className="text-gray-400 dark:text-gray-500">
                  No recent activity
                </li>
              ) : (
                recentActivities.map((activity, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{activity.text}</span>
                    <span className="text-gray-400 dark:text-gray-500">
                      {timeAgo(activity.time)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Settings */}
          <div className="lg:col-span-4 bg-white dark:bg-gray-900 rounded-2xl shadow-md dark:shadow-black/40 p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Account Settings</h3>

            <div className="space-y-3">
              <button
                className="w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-red-50 dark:hover:bg-gray-800 transition"
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit Profile
              </button>

              <button
                className="w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-red-50 dark:hover:bg-gray-800 transition"
                onClick={() => setIsAvatarOpen(true)}
              >
                Change Avatar
              </button>

              <button
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
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
                  else alert("Failed");
                } catch (err) {
                  alert("Error");
                }

                setIsAvatarOpen(false);
              }}
            />
          </div>
        </div>
      </div>

      {/* 🔥 FLOATING ACTION BUTTON */}
      <button
        className="fixed bottom-8 right-6 z-50 bg-red-600 hover:bg-red-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition"
        onClick={() => console.log("FAB Click")}
      >
        +
      </button>
    </main>
  );
}
