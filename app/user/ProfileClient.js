"use client";
import { useState } from "react";
import UserSidebar from "../components/Usesidebar";
import TaskList from "./Tasklist";
import AddTaskDialog from "../components/AddTaskdialuge";

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
  const [openAddDialog, setOpenAddDialog] = useState(false);

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
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">
      {/* ADD TASK MODAL */}
      <AddTaskDialog
        isOpen={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
      />

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:block w-64 h-full bg-white dark:bg-gray-900 shadow-sm overflow-y-auto">
        <UserSidebar
          user={sidebar}
          statusCount={statusCount}
          priorityCount={priorityCount}
        />
      </div>

      {/* MOBILE SIDEBAR */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="fixed top-0 left-0 w-64 h-full bg-white dark:bg-gray-900 shadow-lg overflow-y-auto">
            <UserSidebar
              user={sidebar}
              statusCount={statusCount}
              priorityCount={priorityCount}
            />
          </div>
        </div>
      )}

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <div
          className="sticky top-0 z-40 flex items-center justify-between px-6 h-16 
        bg-white/80 dark:bg-gray-900/80 backdrop-blur-md 
        border-b border-gray-100 dark:border-gray-800"
        >
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              ☰
            </button>

            <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
              Dashboard
            </h1>
          </div>

          {/* RIGHT */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium
              bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
              rounded-full transition"
            >
              Filter ▾
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-900 
              rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden"
              >
                {/* HEADER */}
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b dark:border-gray-800">
                  Filters
                </div>

                {/* PRIORITY */}
                <div className="py-2">
                  <div className="px-4 text-xs text-gray-400 mb-1">
                    PRIORITY
                  </div>

                  {["high", "medium", "low"].map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setSelectedPriority(p);
                        setMenuOpen(false);
                      }}
                      className={`w-full flex justify-between px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800
                      ${
                        selectedPriority === p
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                          : ""
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                      {selectedPriority === p && "✓"}
                    </button>
                  ))}
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800" />

                {/* STATUS */}
                <div className="py-2">
                  <div className="px-4 text-xs text-gray-400 mb-1">STATUS</div>

                  {["not started", "ongoing", "completed"].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSelectedStatus(s);
                        setMenuOpen(false);
                      }}
                      className={`w-full flex justify-between px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800
                      ${
                        selectedStatus === s
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                          : ""
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                      {selectedStatus === s && "✓"}
                    </button>
                  ))}
                </div>

                {/* CLEAR */}
                <div className="border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => {
                      setSelectedPriority("all");
                      setSelectedStatus("all");
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <section className="flex-1 overflow-y-auto p-5 md:p-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-5 md:p-6">
            <h1 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Tasks
            </h1>

            <TaskList initialTasks={filteredTasks} />
          </div>
        </section>
      </div>

      {/* FLOATING ACTION BUTTON */}
      <button
        onClick={() => setOpenAddDialog(true)}
        className={`
    fixed bottom-6 left-1/2 -translate-x-1/2
    px-5 py-3 rounded-full
    bg-green-500 hover:bg-green-600
    text-white text-sm font-medium
    shadow-lg hover:shadow-xl
    transition-all duration-300
    ${sidebarOpen ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"}
  `}
      >
        + Add Task
      </button>
    </div>
  );
}
