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
    filteredTasks = filteredTasks.filter((task) => task.priority === selectedPriority);
  }

  if (selectedStatus !== "all") {
    filteredTasks = filteredTasks.filter((task) => task.status === selectedStatus);
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <UserSidebar
          user={sidebar}
          statusCount={statusCount}
          priorityCount={priorityCount}
          className="w-64"
        />
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Drawer */}
          <div className="relative w-64 bg-white shadow-md">
            <UserSidebar
              user={sidebar}
              statusCount={statusCount}
              priorityCount={priorityCount}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 bg-white shadow">
          {/* Mobile hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="px-3 py-2 border rounded hover:bg-gray-100"
            >
              ☰
            </button>
          </div>

          {/* Empty left for spacing */}
          <div></div>

          {/* Filter button */}
          <div className="relative mr-6">
            <button
              className="flex items-center gap-2 px-3 py-1 border rounded hover:bg-gray-100"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span>Filter</span>
              <span>▾</span>
            </button>

            {menuOpen && (
              <ul className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-md z-50 p-2 space-y-2">
                {/* PRIORITY */}
                <li className="text-xs font-semibold text-gray-500 px-3 pt-1">PRIORITY</li>
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
                <li className="text-xs font-semibold text-gray-500 px-3 pt-1">STATUS</li>
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

        {/* Main Content */}
        <section className="flex-1 p-4 md:p-6 overflow-auto">
          <h1 className="text-xl font-semibold mb-4">Code Block</h1>
          <TaskList initialTasks={filteredTasks} />
        </section>
      </div>
    </div>
  );
}