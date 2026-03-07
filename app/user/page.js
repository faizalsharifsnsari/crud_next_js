import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
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

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("taskify_session")?.value;
  console.log("COOKIE TOKEN:", sessionToken);

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionStr);
  }

  let user = null;

  // ⭐ GOOGLE LOGIN (NextAuth)
  if (session?.user?.id) {
    user = await User.findById(session.user.id).select("name email image");
  }

  // ⭐ TRUECALLER LOGIN (Cookie Session)
  if (!user && sessionToken) {
    console.log("Searching user with sessionToken:", sessionToken);
    user = await User.findOne({ sessionToken }).select("name email image");
  }

  // ⭐ NO AUTH
  if (!user) {
    redirect("/auth/login");
  }

  const tasks = await Taskify.find({ userId: user._id }).sort({ order: 1 });

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
        id: user._id.toString(),
        name: user.name ?? "",
        email: user.email ?? "",
        image: user.image ?? "",
      }}
      tasksWithColors={tasksWithColors}
      statusCount={statusCount}
      priorityCount={priorityCount}
    />
  );
}