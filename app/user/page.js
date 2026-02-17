import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { connectionStr } from "../lib/mongodb";
import { Taskify } from "../lib/model/Product";
import { authOptions } from "../api/auth/[...nextauth]/route";
import User from "../lib/model/User";

import ProfileClient from "./ProfileClient";

const STATUS = {
  NOT_STARTED: "not started",
  ONGOING: "ongoing",
  COMPLETED: "completed",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionStr);
  }

  const dbUser = await User.findById(session.user.id).select("name email image");

  const tasks = await Taskify.find({ userId: session.user.id }).sort({ order: 1 });

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

  return (
    <ProfileClient
      sidebar={{
        id: dbUser?._id?.toString() ?? "",
        name: dbUser?.name ?? "",
        email: dbUser?.email ?? "",
        image: dbUser?.image ?? "",
      }}
      tasksWithColors={tasksWithColors}
      statusCount={statusCount}
      priorityCount={priorityCount}
    />
  );
}
