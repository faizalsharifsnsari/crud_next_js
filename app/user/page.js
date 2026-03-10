import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectionStr } from "../lib/mongodb";
import { Taskify } from "../lib/model/Product";
import { authOptions } from "../api/auth/[...nextauth]/route";
import User from "../lib/model/User";
import ProfileClient from "./ProfileClient";

export default async function UserPage() {
  // 1️⃣ Try Google login first
  const session = await getServerSession(authOptions);

  if (mongoose.connection.readyState === 0) await mongoose.connect(connectionStr);

  let user = null;

  if (session?.user?.id) {
    console.log("Google login detected:", session.user.id);
    user = await User.findById(session.user.id).select("name email image sessionToken");
  }

  // 2️⃣ If no Google login, fallback to Truecaller
  if (!user) {
    const cookieStore = await cookies();
    const truecallerToken = cookieStore.get("truecaller_session")?.value;

    if (truecallerToken) {
      console.log("Truecaller login detected:", truecallerToken);
      user = await User.findOne({ sessionToken: truecallerToken }).select(
        "name email image sessionToken"
      );
    }
  }

  // 3️⃣ If no auth at all → redirect
  if (!user) {
    console.log("No authentication found → redirecting to login");
    redirect("/auth/login");
  }

  // 4️⃣ Fetch tasks
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
    if (task.status === "not started") statusCount.notStarted++;
    if (task.status === "ongoing") statusCount.ongoing++;
    if (task.status === "completed") statusCount.completed++;

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