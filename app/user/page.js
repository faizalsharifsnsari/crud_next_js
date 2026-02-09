import { cookies } from "next/headers";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import TaskList from "./Tasklist";

import UserSidebar from "../components/Usesidebar";



export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/login");
  }

  // ✅ await cookies()
  const cookieStore = await cookies();

  const res = await fetch("/api/products", {
    headers: {
      Cookie: cookieStore.toString(),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return <p>Failed to load tasks</p>;
  }

  const data = await res.json();

const tasksWithColors = (data.result || []).map((task) => ({
  id: task._id.toString(),
  title: task.title,
  description: task.description || "",   // ✅ include description
  priority: task.priority,
  status: task.status,
  dueDate: task.dueDate || null,         // ✅ include due date
  createdAt: task.createdAt,             // ✅ include createdAt
  updatedAt: task.updatedAt,             // ✅ include updatedAt

  priorityBorder:
    task.priority === "high"
      ? "border-l-rose-300"
      : task.priority === "medium"
      ? "border-l-amber-300"
      : "border-l-emerald-300",
}));


const statusCount = {
  notStarted: tasksWithColors.filter(t => t.status === "not started").length,
  ongoing: tasksWithColors.filter(t => t.status === "ongoing").length,
  completed: tasksWithColors.filter(t => t.status === "completed").length,
};

const priorityCount = {
  high: tasksWithColors.filter(t => t.priority === "high").length,
  medium: tasksWithColors.filter(t => t.priority === "medium").length,
  low: tasksWithColors.filter(t => t.priority === "low").length,
};





  const user = session.user;

//status icon



  

 return (
    <main className="flex min-h-screen">
      <UserSidebar
        user={user}
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
