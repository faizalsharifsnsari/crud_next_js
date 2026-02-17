"use client";
import { useState } from "react";
import Link from "next/link";
import UserSidebar from "../components/Usesidebar";
import TaskList from "./Tasklist";

export default function ProfileClient({
  sidebar,
  tasksWithColors,
  statusCount,
  priorityCount,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedStatus,setSelectedStatus] = useState("all");
  let filteredTasks = tasksWithColors;

  //filtered by priority
  if(selectedPriority !== "all"){
    filteredTasks = filteredTasks.filter(function (task){
      return task.priority === selectedPriority;
    })
  }
  // filtered by status
  if(selectedStatus !== "all"){
    filteredTasks = filteredTasks.filter(function (task){
      return task.status === selectedStatus;
    })
  }

   

  return (
    <div className="flex h-screen">
      <UserSidebar
        user={sidebar}
        statusCount={statusCount}
        priorityCount={priorityCount}
      />

      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 bg-white shadow">
          {/* Left side can have logo or empty */}
          <div></div>

          {/* Right side: Menu button */}
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
                {/* PRIORITY SECTION */}
                <li className="text-xs font-semibold text-gray-500 px-3 pt-1">
                  PRIORITY
                </li>
                <button
                  onClick={() => {
                    setSelectedPriority("high");
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                >
                  High
                </button>

                <li>
                  <button className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded" onClick={()=>{
                    setSelectedPriority("medium");
                    setMenuOpen(false);
                  }}>
                    Medium
                  </button>
                </li>
                <li>
                  <button className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded" onClick={()=>{
                    setSelectedPriority("low");
                    setMenuOpen(false);
                  }}>
                    Low
                  </button>
                </li>

                <hr />

                {/* STATUS SECTION */}
                <li className="text-xs font-semibold text-gray-500 px-3 pt-1">
                  STATUS
                </li>
                <li>
                  <button className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded" onClick={()=>{
                    setSelectedStatus("not started");
                    setMenuOpen(false);
                  }}>
                    Not Started
                  </button>
                </li>
                <li>
                  <button className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded" onClick={()=>{
                    setSelectedStatus("ongoing");
                    setMenuOpen(false);
                  }}>
                    On Going
                  </button>
                </li>
                <li>
                  <button className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded" onClick={()=>{
                    setSelectedStatus("completed");
                    setMenuOpen(false);
                  }}>
                    Completed
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Main Content */}
        <section className="flex-1 p-6 overflow-auto">
          <h1 className="text-xl font-semibold mb-4">My Tasks</h1>
          <TaskList initialTasks={filteredTasks} />
        </section>  
      </div>
    </div>
  );
}
