"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
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

export default function ProfilePreview({
  sidebar,
  tasksWithColors = [],
}) {
  // ✅ use server data directly
  const [tasks, setTasks] = useState(tasksWithColors);
  const [user, setUser] = useState(sidebar);

  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ update name
  const handleNameSave = async (newName) => {
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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

  // ✅ counts
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

  // ✅ safe percent
  const getPercent = (value) =>
    tasks.length ? Math.round((value / tasks.length) * 100) : 0;

  // ✅ recent activity
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
    <main className="min-h-screen bg-green-200 dark:bg-gray-900 relative pt-20 px-4 md:px-6 lg:px-8">

      {/* MENU */}
      <div className="fixed top-4 left-4 z-50">
        <div className="bg-red-500 rounded-lg p-1 border border-red-600">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded hover:bg-red-600"
          >
            <div className="w-6 h-0.5 bg-white mb-1"></div>
            <div className="w-6 h-0.5 bg-white mb-1"></div>
            <div className="w-6 h-0.5 bg-white"></div>
          </button>
        </div>

        {menuOpen && (
          <ul className="absolute left-0 mt-3 w-40 bg-white dark:bg-gray-800 rounded shadow-md">
            <li>
              <Link href="/" className="block px-4 py-2 hover:bg-red-100">
                Home
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="block px-4 py-2 hover:bg-red-100">
                Profile
              </Link>
            </li>
          </ul>
        )}
      </div>

      {/* PROFILE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* USER CARD */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-2xl p-6">
          <div className="flex flex-col items-center text-center">
            {user?.image ? (
              <Image
                src={user.image}
                alt="Profile"
                width={80}
                height={80}
                className="rounded-full"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                No Image
              </div>
            )}

            <h2 className="text-xl font-bold mt-2">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* STATS */}
        <div className="lg:col-span-8 grid sm:grid-cols-2 gap-6">

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
            <h3 className="mb-4">Task Priority</h3>

            <div className="flex justify-between">
              <CircleStat label="High" percent={getPercent(priorityCount.high)} count={priorityCount.high} color="#FEE2E2" />
              <CircleStat label="Medium" percent={getPercent(priorityCount.medium)} count={priorityCount.medium} color="#FEF3C7" />
              <CircleStat label="Low" percent={getPercent(priorityCount.low)} count={priorityCount.low} color="#DCFCE7" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
            <h3 className="mb-4">Task Status</h3>

            <div className="flex justify-between">
              <CircleStat label="Completed" percent={getPercent(statusCount.completed)} count={statusCount.completed} color="#DCFCE7" />
              <CircleStat label="Ongoing" percent={getPercent(statusCount.ongoing)} count={statusCount.ongoing} color="#DBEAFE" />
              <CircleStat label="Not Started" percent={getPercent(statusCount.notStarted)} count={statusCount.notStarted} color="#E5E7EB" />
            </div>
          </div>

        </div>
      </div>

      {/* ACTIVITY + SETTINGS */}
      <div className="grid lg:grid-cols-12 gap-6 mt-6">

        {/* ACTIVITY */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-2xl p-6">
          <h3 className="mb-4">Recent Activity</h3>

          {recentActivities.length === 0 ? (
            <p>No activity</p>
          ) : (
            recentActivities.map((a, i) => (
              <div key={i} className="flex justify-between">
                <span>{a.text}</span>
                <span className="text-gray-400">{timeAgo(a.time)}</span>
              </div>
            ))
          )}
        </div>

        {/* SETTINGS */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-2xl p-6 space-y-3">

          <button onClick={() => setIsEditModalOpen(true)} className="w-full py-2 border rounded">
            Edit Profile
          </button>

          <button onClick={() => setIsAvatarOpen(true)} className="w-full py-2 border rounded">
            Change Avatar
          </button>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full py-2 bg-red-600 text-white rounded"
          >
            Logout
          </button>

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
              const res = await fetch("/api/user", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: newImageUrl }),
              });

              const data = await res.json();
              if (data.success) setUser(data.user);

              setIsAvatarOpen(false);
            }}
          />

        </div>
      </div>
    </main>
  );
}