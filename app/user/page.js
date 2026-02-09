import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "../api/auth/[...nextauth]/route";
import TaskList from "./Tasklist";
import UserSidebar from "../components/Usesidebar";

import mongoose from "mongoose";
import Taskify from "@/models/Taskify"; // adjust path
import { connectionStr } from "@/lib/db"; // adjust path

const STATUS = {
  NOT_STARTED: "not started",
  ONGOING: "ongoing",
  COMPLETED: "completed",
};

export default async function ProfilePage() {
  // 🔐 Auth
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  // 🔌 DB connect (safe for prod)
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionStr);
  }

  // 🔥 DIRECT DATA ACCESS (NO API)
  const tasks = await Taskify.find({
    userId: session.user.id, // OR userEmail if that’s what you store
  }).sort({ order: 1 });

  // 🧼 Normalize
  const tasksWithColors = tasks.map((task) => ({
    id: task._id.toString(),
    title: task.title,
    description: task.description ?? "",
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate ?? null,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    priorityBorder:
      task.priority === "high"
        ? "border-l-rose-300"
        : task.priority === "medium"
        ? "border-l-amber-300"
        : "border-l-emerald-300",
  }));

  // 📊 Counts
  const statusCount = { notStarted: 0, ongoing: 0, completed: 0 };
  const priorityCount = { high: 0, medium: 0, low: 0 };

  for (const task of tasksWithColors) {
    if (task.status === STATUS.NOT_STARTED) statusCount.notStarted++;
    if (task.status === STATUS.ONGOING) statusCount.ongoing++;
    if (task.status === STATUS.COMPLETED) statusCount.completed++;

    if (task.priority === "high") priorityCount.high++;
    if (task.priority === "medium") priorityCount.medium++;
    if (task.priority === "low") priorityCount.low++;
  }

  // 🖥️ Render
  return (
    <main className="flex min-h-screen">
      <UserSidebar
        user={session.user}
        statusCount={statusCount}
        priorityCount={priorityCount}
      />

      <section className="flex-1 p-6">
        <h1 className="text-xl font-semibold mb-4">My Tasks</h1>
        <TaskList initialTasks={tasksWithColors} />
      </section>
    </main>
  );
}
