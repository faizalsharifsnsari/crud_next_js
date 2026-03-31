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
    <div className="flex h-screen overflow-hidden bg-green-100 dark:bg-gray-800">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
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
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed top-0 left-0 w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
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
        {/* 🔥 Top Bar */}
        <div className="flex items-center justify-between px-4 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              ☰
            </button>
          </div>

          <div></div>

          {/* Filter */}
          <div className="relative">
            <button
              className="flex items-center gap-2 px-3 py-1.5 text-sm 
              bg-gray-100 dark:bg-gray-800 
              border border-gray-300 dark:border-gray-700 
              rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span>Filter</span>
              <span>▾</span>
            </button>

            {menuOpen && (
              <ul className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md z-50 p-2 space-y-2 text-black dark:text-white">
                {/* PRIORITY */}
                <li className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 pt-1">
                  PRIORITY
                </li>

                {["high", "medium", "low"].map((p) => (
                  <li key={p}>
                    <button
                      className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => {
                        setSelectedPriority(p);
                        setMenuOpen(false);
                      }}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  </li>
                ))}

                <hr className="border-gray-200 dark:border-gray-700" />

                {/* STATUS */}
                <li className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 pt-1">
                  STATUS
                </li>

                {["not started", "ongoing", "completed"].map((s) => (
                  <li key={s}>
                    <button
                      className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
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

        {/* 🔥 MAIN SECTION */}
        <section className="flex-1 flex flex-col">
          {/* ✅ TASK CONTAINER */}
          <div className="h-[80vh] overflow-y-auto p-4 md:p-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
              <h1 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Tasks
              </h1>

              <TaskList initialTasks={filteredTasks} />
            </div>
          </div>

          {/* ✅ BOTTOM SECTION */}
          <div className="h-[20vh] flex items-center justify-center border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            {/* ✅ Add Task Button */}
            <button
              className="
              px-5 py-2.5 rounded-full
              bg-green-500 hover:bg-green-600
              text-white text-sm font-medium
              shadow-md hover:shadow-lg
              transition-all
              "
            >
              + Add Task
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
