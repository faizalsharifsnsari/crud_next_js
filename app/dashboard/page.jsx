"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { useEffect } from "react";
import EditProfileModal from "../components/profile/Editprofiledialuge";
import ChangeAvatarModal from "../components/profile/ChangeAvatarModal";

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
    <main className="min-h-screen bg-gray-50 p-8">
      {/* Top section */}
      <div className="grid grid-cols-12 gap-6">
        {/* Profile Card */}
        <div className="col-span-4 bg-white rounded-2xl shadow p-6">
          <div className="flex flex-col items-center text-center">
            {session?.user?.image && (
              <Image
                src={user?.image}
                alt="Profile"
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
            )}

            <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>

            <p className="text-sm text-gray-500 break-all">{user?.email}</p>

            <div className="mt-4 text-xs text-gray-400">
              Member since • Jan 2024
            </div>
          </div>
        </div>

        {/* Stats Section (NOW SIDE BY SIDE) */}
        <div className="col-span-8 grid grid-cols-2 gap-6">
          {/* Priority Card */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">
              Task Priority
            </h3>

            <div className="flex justify-between">
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

          {/* Status Card */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">
              Task Status
            </h3>

            <div className="flex justify-between">
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
      <div className="grid grid-cols-12 gap-6 mt-8">
        {/* Activity */}
        {/* Activity */}
        <div className="col-span-8 bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

          <ul className="space-y-4 text-sm">
            {recentActivities.length === 0 ? (
              <li className="text-gray-400">No recent activity</li>
            ) : (
              recentActivities.map((activity, index) => (
                <li key={index} className="flex justify-between">
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
        <div className="col-span-4 bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Account Settings</h3>

          <div className="space-y-3">
            <button
              className="w-full py-2 rounded-lg border text-sm hover:bg-gray-50"
              onClick={() => setIsEditOpen(true)}
            >
              Edit Profile
            </button>
            <button
              className="w-full py-2 rounded-lg border text-sm hover:bg-gray-50"
              onClick={() => setIsAvatarOpen(true)}
            >
              Change Avatar
            </button>
            <button className="w-full py-2 rounded-lg text-sm bg-red-50 text-red-600 hover:bg-red-100">
              Logout
            </button>
          </div>
          <EditProfileModal
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            user={user}
            onSave={(newName) => {
              setUser({ ...user, name: newName });
              setIsEditOpen(false);
            }}
          />
          <ChangeAvatarModal
            isOpen={isAvatarOpen}
            onClose={() => setIsAvatarOpen(false)}
            user={user}
            onSave={(newImage) => {
              setUser({ ...user, image: newImage });
              setIsAvatarOpen(false);
            }}
          />
        </div>
      </div>
    </main>
  );
}
