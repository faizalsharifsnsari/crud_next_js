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
  console.log("=========== PROFILE PAGE LOADED ===========");

  const session = await getServerSession(authOptions);
  console.log("NEXTAUTH SESSION:", session);

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("taskify_session")?.value;

  console.log("COOKIE TOKEN (taskify_session):", sessionToken);

  if (mongoose.connection.readyState === 0) {
    console.log("MongoDB not connected. Connecting now...");
    await mongoose.connect(connectionStr);
    console.log("MongoDB connected.");
  }

  let user = null;

  // ⭐ GOOGLE LOGIN
  if (session?.user?.id) {
    console.log("Google login detected. Session user ID:", session.user.id);

    user = await User.findById(session.user.id).select(
      "_id name email image sessionToken"
    );

    console.log("User found via Google session:", user);
  }

  // ⭐ TRUECALLER LOGIN
  if (!user && sessionToken) {
    console.log(
      "Truecaller login detected. Searching with sessionToken:",
      sessionToken
    );

    user = await User.findOne({ sessionToken }).select(
      "_id name email image sessionToken"
    );

    console.log("User found via Truecaller sessionToken:", user);
  }

  // ⭐ NO AUTH FOUND
  if (!session?.user?.id && !sessionToken) {
    console.log("No authentication found. Redirecting to login.");
    redirect("/auth/login");
  }

  // ⭐ TOKEN EXISTS BUT USER NOT FOUND
  if (!user) {
    console.log(
      "Authentication token exists but no matching user in database."
    );
    console.log("Session:", session);
    console.log("SessionToken:", sessionToken);

    redirect("/auth/login");
  }

  console.log("FINAL USER OBJECT USED FOR DASHBOARD:", user);

  const tasks = await Taskify.find({ userId: user._id }).sort({ order: 1 });

  console.log("Tasks fetched for user:", user._id, "Total:", tasks.length);

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

  const statusCount = {
    notStarted: 0,
    ongoing: 0,
    completed: 0,
  };

  const priorityCount = {
    high: 0,
    medium: 0,
    low: 0,
  };

  for (const task of tasksWithColors) {
    if (task.status === STATUS.NOT_STARTED) statusCount.notStarted++;
    if (task.status === STATUS.ONGOING) statusCount.ongoing++;
    if (task.status === STATUS.COMPLETED) statusCount.completed++;

    if (task.priority === "high") priorityCount.high++;
    if (task.priority === "medium") priorityCount.medium++;
    if (task.priority === "low") priorityCount.low++;
  }

  console.log("STATUS COUNT:", statusCount);
  console.log("PRIORITY COUNT:", priorityCount);

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