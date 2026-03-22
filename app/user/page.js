import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectionStr } from "../lib/mongodb";
import { Taskify } from "../lib/model/Product";
import { authOptions } from "../api/auth/[...nextauth]/route";
import NextAuthUser from "../lib/model/NextAuthUser";
import TruecallerUser from "../lib/model/User";
import ProfileClient from "./ProfileClient";

const STATUS = {
  NOT_STARTED: "not started",
  ONGOING: "ongoing",
  COMPLETED: "completed",
};

export default async function ProfilePage() {
  console.log("🔥 PROFILE PAGE START");

  // 🔹 SESSION + COOKIE
  const session = await getServerSession(authOptions);
  console.log("🟡 SESSION:", session);

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("taskify_session")?.value;
  console.log("🟡 TRUECALLER COOKIE TOKEN:", sessionToken);

  // 🔹 DB CONNECTION
  if (mongoose.connection.readyState === 0) {
    console.log("🟡 Connecting to DB...");
    await mongoose.connect(connectionStr);
    console.log("🟢 DB Connected");
  }

  let user = null;

  // =========================================
  // 🔥 TRUECALLER LOGIN (PRIORITY)
  // =========================================
  if (sessionToken) {
    console.log("🟢 TRUECALLER LOGIN DETECTED");

    user = await TruecallerUser.findOne({ sessionToken }).select(
      "name email image sessionToken",
    );

    console.log("🟢 TRUECALLER USER FOUND:", user);
  } else {
    console.log("🔴 No Truecaller sessionToken found");
  }

  // =========================================
  // 🔥 GOOGLE LOGIN (FALLBACK)
  // =========================================
  if (!user && session?.user?.id) {
    console.log("🟢 GOOGLE LOGIN DETECTED:", session.user.id);

    user = await NextAuthUser.findById(session.user.id).select(
      "name email image",
    );

    console.log("🟢 GOOGLE USER FOUND:", user);
  } else if (!session?.user?.id) {
    console.log("🔴 No Google session found");
  }

  // =========================================
  // ❌ NO USER FOUND
  // =========================================
  if (!user) {
    console.log("❌ NO VALID USER FOUND → REDIRECT");
    redirect("/auth/login");
  }

  console.log("🔥 FINAL USER SELECTED:", user);
  console.log("🔥 FINAL USER ID:", user._id);

  // =========================================
  // 🔥 FETCH TASKS
  // =========================================
  console.log("🟡 Fetching tasks for userId:", user._id);

  const tasks = await Taskify.find({ userId: user._id }).sort({ order: 1 });

  console.log("🟢 TASKS FETCHED:", tasks.length);
  console.log("🟢 TASKS DATA:", tasks);

  // =========================================
  // 🔄 FORMAT TASKS
  // =========================================
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

  console.log("🟢 FORMATTED TASKS:", tasksWithColors);

  // =========================================
  // 📊 COUNTS
  // =========================================
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

  console.log("📊 STATUS COUNT:", statusCount);
  console.log("📊 PRIORITY COUNT:", priorityCount);

  // =========================================
  // 🚀 FINAL RETURN
  // =========================================
  console.log("🚀 SENDING DATA TO CLIENT");

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
