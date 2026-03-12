"use client";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { useEffect } from "react";
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
        <span className="text-lg font-bold text-gray-800">{percent}%</span>
      </div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-xs text-gray-500">{count} tasks</p>
    </div>
  );
}

export default function ProfilePreview() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  //for fetching the user data
  useEffect(() => {
    if (!session) return;

    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
        }
      });
  }, [session]);

  //for fetching the products data
  useEffect(() => {
    if (!session) return;

    fetch("/api/products") // ← your API route
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTasks(data.result);
        }
        setLoading(false);
      });
  }, [session]);
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
  //this code is for the recent task
  // 🔥 SORT tasks by latest activity (updatedAt > createdAt)
  const sortedTasks = [...tasks].sort(
    (a, b) =>
      new Date(b.updatedAt || b.createdAt) -
      new Date(a.updatedAt || a.createdAt),
  );

  // 🔥 BUILD recent activity list
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

  // ⏱ Time formatter
  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  
return (
  <main className="min-h-screen bg-gray-50 dark:bg-gray-900 relative pt-20 px-4 md:px-6 lg:px-8">

    {/* Hamburger Menu */}
    <div className="fixed top-4 left-4 z-50">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-md rounded-lg p-1 border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Menu"
        >
          <div className="w-6 h-0.5 bg-gray-800 dark:bg-gray-200 mb-1"></div>
          <div className="w-6 h-0.5 bg-gray-800 dark:bg-gray-200 mb-1"></div>
          <div className="w-6 h-0.5 bg-gray-800 dark:bg-gray-200"></div>
        </button>
      </div>

      {menuOpen && (
        <ul className="absolute left-0 mt-3 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-md">
          <li>
            <Link
              href="/"
              className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setMenuOpen(false)}
            >
              Go to Home
            </Link>
          </li>

          <li>
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
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
      <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-2xl shadow p-5 md:p-6 border border-gray-100 dark:border-gray-700">
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

        {/* Priority Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 md:p-6 border border-gray-100 dark:border-gray-700">
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
              percent={Math.round((priorityCount.medium / tasks.length) * 100)}
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

        {/* Status Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 md:p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-4">
            Task Status
          </h3>

          <div className="flex flex-wrap justify-between gap-4">
            <CircleStat
              label="Completed"
              percent={Math.round((statusCount.completed / tasks.length) * 100)}
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
              percent={Math.round((statusCount.notStarted / tasks.length) * 100)}
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
      <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-2xl shadow p-5 md:p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Recent Activity
        </h3>

        <ul className="space-y-4 text-sm">
          {recentActivities.length === 0 ? (
            <li className="text-gray-400">No recent activity</li>
          ) : (
            recentActivities.map((activity, index) => (
              <li key={index} className="flex justify-between text-gray-700 dark:text-gray-300">
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
      <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-2xl shadow p-5 md:p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Account Settings
        </h3>

        <div className="space-y-3">
          <button
            className="w-full py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Profile
          </button>

          <button
            className="w-full py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            onClick={() => setIsAvatarOpen(true)}
          >
            Change Avatar
          </button>

          <button
            className="w-full py-2 rounded-lg text-sm bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900"
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
