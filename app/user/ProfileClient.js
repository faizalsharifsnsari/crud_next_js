"use client";
import { useState } from "react";
import UserSidebar from "../components/Usesidebar";
import TaskList from "./Tasklist";

export default function ProfileClient({
  sidebar,
  tasksWithColors,
  statusCount,
  priorityCount,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [open, setOpen] = useState(false);
  <AddTaskDialog isOpen={open} onClose={() => setOpen(false)} />;

  let filteredTasks = tasksWithColors;

  if (selectedPriority !== "all") {
    filteredTasks = filteredTasks.filter(
      (task) => task.priority === selectedPriority,
    );
  }

  if (selectedStatus !== "all") {
    filteredTasks = filteredTasks.filter(
      (task) => task.status === selectedStatus,
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-green-200 dark:bg-gray-800">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 h-full bg-green-200 dark:bg-gray-800 shadow-md overflow-y-auto">
        <UserSidebar
          user={sidebar}
          statusCount={statusCount}
          priorityCount={priorityCount}
        />
      </div>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed top-0 left-0 w-64 h-screen bg-green-200 shadow-md overflow-y-auto">
            <UserSidebar
              user={sidebar}
              statusCount={statusCount}
              priorityCount={priorityCount}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 bg-red-500 dark:bg-red-500 text-white shadow">
          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="px-3 py-2 border border-green-200 rounded hover:bg-red-500"
            >
              ☰
            </button>
          </div>

          {/* Spacer */}
          <div></div>

          {/* Filter */}
          <div className="relative mr-6">
            <button
              className="flex items-center gap-2 px-3 py-1 border border-white rounded hover:bg-red-500"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span>Filter</span>
              <span>▾</span>
            </button>

            {menuOpen && (
              <ul className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-md z-50 p-2 space-y-2 text-black">
                {/* PRIORITY */}
                <li className="text-xs font-semibold text-gray-500 px-3 pt-1">
                  PRIORITY
                </li>

                {["high", "medium", "low"].map((p) => (
                  <li key={p}>
                    <button
                      className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                      onClick={() => {
                        setSelectedPriority(p);
                        setMenuOpen(false);
                      }}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  </li>
                ))}

                <hr />

                {/* STATUS */}
                <li className="text-xs font-semibold text-gray-500 px-3 pt-1">
                  STATUS
                </li>

                {["not started", "ongoing", "completed"].map((s) => (
                  <li key={s}>
                    <button
                      className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                      onClick={() => {
                        setSelectedStatus(s);
                        setMenuOpen(false);
                      }}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Main Section */}
        <section className="flex-1 p-4 md:p-6 overflow-auto">
          <h1 className="text-xl font-semibold mb-4">Code Block</h1>
          <TaskList initialTasks={filteredTasks} />
        </section>
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => setOpen(true)}
            className="
      w-16 h-16
      rounded-full
      bg-blue-600 hover:bg-blue-700
      text-white text-3xl
      flex items-center justify-center
      shadow-2xl
      transition-all duration-200
      active:scale-95
    "
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
