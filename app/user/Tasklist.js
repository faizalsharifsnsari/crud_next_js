"use client";
import { ClockIcon, PlayIcon, CheckIcon } from "@heroicons/react/24/solid";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect } from "react";
import styles from "./user.module.css";

//priority colours

//icon code
function StatusIcon({ status, onClick }) {
  const base =
    "w-9 h-9 rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition";

  if (status === "completed") {
    return (
      <div
        onClick={onClick}
        className={`${base} bg-green-500 text-white`}
        title="Completed - click to view"
      >
        <CheckIcon className="w-5 h-5" />
      </div>
    );
  }

  if (status === "ongoing") {
    return (
      <div
        onClick={onClick}
        className={`${base} bg-blue-500 text-white`}
        title="Ongoing - click to view"
      >
        <PlayIcon className="w-5 h-5 ml-[1px]" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`${base} bg-gray-400 text-white`}
      title="Not started - click to view"
    >
      <ClockIcon className="w-5 h-5" />
    </div>
  );
}

//update api
const saveEditedTask = async (task) => {
  try {
    if (!task.title || task.title.trim() === "") {
      alert("Title is required ❌");
      return;
    }

    const res = await fetch(`/api/products/${task.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
      }),
    });

    // ✅ REMOVE hard fail here
    const data = await res.json();

    console.log("API RESPONSE:", data); // 🔍 debug

    // 🔁 Safe UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, ...(data.task || task) } : t
      )
    );

    alert("Changes saved successfully ✅");
    setEditingTask(null);

  } catch (err) {
    console.error("Update error:", err);
    alert("Something went wrong ❌");
  }
};
/* ---------------- SORTABLE TASK ---------------- */
function SortableTask({ task, onDelete, onEdit, onView }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: "none",
      }}
      className={`
      flex items-center justify-between
      cursor-grab active:cursor-grabbing
      p-3 mb-3 rounded-lg
      border-l-4 shadow-sm
      ${
        task.priority === "high"
          ? "border-red-500 bg-red-200"
          : task.priority === "medium"
            ? "border-yellow-500 bg-yellow-200"
            : "border-green-500 bg-green-200"
      }
      `}
      {...attributes}
      {...listeners}
    >
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3 flex-1">
        {/* STATUS ICON (now clickable) */}
        <StatusIcon status={task.status} onClick={() => onView(task)} />

        <span className="text-sm font-semibold text-gray-800 truncate">
          {task.title}
        </span>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-2">
        <button
          className="
          px-3 py-1 text-xs font-medium rounded-md
          bg-green-500 hover:bg-green-600
          text-white transition
          "
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
        >
          Edit
        </button>

        <button
          className="
          px-3 py-1 text-xs font-medium rounded-md
          bg-red-500 hover:bg-red-600
          text-white transition
          "
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
/* ---------------- TASK LIST ---------------- */
export default function TaskList({ initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [editingTask, setEditingTask] = useState(null);
  const [viewTask, setViewTask] = useState(null);
  const [loadingViewTask, setLoadingViewTask] = useState(false);

  //dynamic update
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // 🗑️ DELETE
  const deleteTask = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
  );

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setTasks((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);

      const updated = arrayMove(items, oldIndex, newIndex);

      // 🔥 Send updated order to backend
      saveOrder(updated);

      return updated;
    });
  }

  // helper function to call PATCH API
  async function saveOrder(updatedTasks) {
    try {
      await fetch("/api/products/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          updatedTasks.map((task, index) => ({
            id: task.id,
            order: index,
          })),
        ),
      });
    } catch (err) {
      console.error("Failed to save order:", err);
    }
  }

  return (
    <>
      {viewTask && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-[400px] max-w-[90%] p-6 border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
                Task Details
              </h3>
              <button
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                onClick={() => setViewTask(null)}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Title */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </h4>
              <p className="text-gray-800 dark:text-gray-100 font-bold text-base">
                {viewTask.title || "Untitled Task"}
              </p>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700">
                Description:
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line">
                {viewTask.description && viewTask.description.trim() !== ""
                  ? viewTask.description
                  : "No description provided."}
              </p>
            </div>

            {/* Priority & Status */}
            <div className="flex items-center gap-3 mb-4">
              {/* Priority badge */}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  viewTask.priority === "high"
                    ? "bg-red-100 text-red-800"
                    : viewTask.priority === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                }`}
              >
                Priority: {(viewTask.priority || "low").toUpperCase()}
              </span>

              {/* Status badge */}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  viewTask.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : viewTask.status === "ongoing"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-200 text-gray-800"
                }`}
              >
                Status: {(viewTask.status || "not started").toUpperCase()}
              </span>
            </div>

            {/* Dates */}
            <div className="mb-4 grid grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <h4 className="font-medium">Due Date</h4>
                <p>
                  {viewTask.dueDate
                    ? new Date(viewTask.dueDate).toLocaleString()
                    : "-"}
                </p>
              </div>
              <div>
                <h4 className="font-medium">Created At</h4>
                <p>
                  {viewTask.createdAt
                    ? new Date(viewTask.createdAt).toLocaleString()
                    : "-"}
                </p>
              </div>
              <div>
                <h4 className="font-medium">Updated At</h4>
                <p>
                  {viewTask.updatedAt
                    ? new Date(viewTask.updatedAt).toLocaleString()
                    : "-"}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium"
                onClick={() => setViewTask(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Edit Task
            </h3>

            {/* Title */}
            <div className="mb-3">
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Title
              </label>
              <input
                type="text"
                value={editingTask.title}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, title: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={editingTask.description || ""}
                onChange={(e) =>
                  setEditingTask({
                    ...editingTask,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Row */}
            <div className="flex gap-3 mb-3">
              <select
                value={editingTask.priority || "medium"}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, priority: e.target.value })
                }
                className="flex-1 px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={editingTask.status || "not started"}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, status: e.target.value })
                }
                className="flex-1 px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
              >
                <option value="not started">Pending</option>
                <option value="ongoing">On Going</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Date */}
            <div className="mb-4">
              <input
                type="date"
                value={editingTask.dueDate || ""}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, dueDate: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => saveEditedTask(editingTask)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition"
              >
                Save
              </button>

              <button
                onClick={() => setEditingTask(null)}
                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className={styles.taskList}>
            {tasks.map((task) => (
              <SortableTask
                key={task.id}
                task={task}
                onDelete={deleteTask}
                onEdit={(task) => setEditingTask(task)}
                onView={(task) => setViewTask(task)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
}
