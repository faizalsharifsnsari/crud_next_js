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
  const [saving, setSaving] = useState(false);

  //dynamic update
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  //update api
  const saveEditedTask = async (task) => {
    try {
      setSaving(true); // ✅ START LOADING

      if (!task.title || task.title.trim() === "") {
        alert("Title is required");
        setSaving(false);
        return;
      }

      if (!task.priority) {
        alert("Please select priority");
        setSaving(false);
        return;
      }

      if (!task.status) {
        alert("Please select status");
        setSaving(false);
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

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Update failed");
        setSaving(false);
        return;
      }

      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, ...data.task } : t)),
      );

      alert("Task updated successfully ✅");

      setEditingTask(null);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setSaving(false); // ✅ STOP LOADING
    }
  };
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className="w-[420px] max-w-[92%] rounded-xl shadow-2xl overflow-hidden
      bg-green-100 dark:bg-gray-900
      border border-green-300 dark:border-gray-700"
          >
            {/* 🔴 HEADER (NEW - visible change) */}
            <div
              className="flex justify-between items-center px-5 py-3
        bg-red-500 text-white"
            >
              <h3 className="text-lg font-semibold truncate">Task Details</h3>
              <button
                className="hover:text-gray-200"
                onClick={() => setViewTask(null)}
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <div className="p-5 space-y-4">
              {/* Title */}
              <div className="p-3 rounded-lg bg-white/60 dark:bg-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  TITLE
                </p>
                <p className="text-gray-900 dark:text-white font-semibold">
                  {viewTask.title || "Untitled Task"}
                </p>
              </div>

              {/* Description */}
              <div className="p-3 rounded-lg bg-white/60 dark:bg-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  DESCRIPTION
                </p>
                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-line">
                  {viewTask.description?.trim()
                    ? viewTask.description
                    : "No description provided."}
                </p>
              </div>

              {/* Badges */}
              <div className="flex gap-2 flex-wrap">
                {/* Priority */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                    viewTask.priority === "high"
                      ? "bg-red-500 text-white"
                      : viewTask.priority === "medium"
                        ? "bg-yellow-400 text-black"
                        : "bg-green-500 text-white"
                  }`}
                >
                  {viewTask.priority?.toUpperCase() || "LOW"}
                </span>

                {/* Status */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                    viewTask.status === "completed"
                      ? "bg-green-600 text-white"
                      : viewTask.status === "ongoing"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-500 text-white"
                  }`}
                >
                  {viewTask.status?.toUpperCase() || "NOT STARTED"}
                </span>
              </div>

              {/* Dates (NEW layout) */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-2 rounded-md bg-white/60 dark:bg-gray-800 text-center">
                  <p className="text-gray-500">Due</p>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">
                    {viewTask.dueDate
                      ? new Date(viewTask.dueDate).toLocaleDateString()
                      : "-"}
                  </p>
                </div>

                <div className="p-2 rounded-md bg-white/60 dark:bg-gray-800 text-center">
                  <p className="text-gray-500">Created</p>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">
                    {viewTask.createdAt
                      ? new Date(viewTask.createdAt).toLocaleDateString()
                      : "-"}
                  </p>
                </div>

                <div className="p-2 rounded-md bg-white/60 dark:bg-gray-800 text-center">
                  <p className="text-gray-500">Updated</p>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">
                    {viewTask.updatedAt
                      ? new Date(viewTask.updatedAt).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end pt-2">
                <button
                  className="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600"
                  onClick={() => setViewTask(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            className="w-full max-w-lg mx-4 rounded-xl shadow-xl p-6
      bg-green-100 dark:bg-gray-900
      border border-green-300 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Edit Task
            </h3>

            {/* Title */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={editingTask.title}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, title: e.target.value })
                }
                placeholder="Enter task title"
                className="w-full px-3 py-2 rounded-md border
          bg-white dark:bg-gray-800
          border-gray-300 dark:border-gray-600
          text-gray-800 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                rows={4}
                className="w-full px-3 py-2 rounded-md border
          bg-white dark:bg-gray-800
          border-gray-300 dark:border-gray-600
          text-gray-800 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            {/* Priority */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={editingTask.priority || "medium"}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, priority: e.target.value })
                }
                className="w-full px-3 py-2 rounded-md border
          bg-white dark:bg-gray-800
          border-gray-300 dark:border-gray-600
          text-gray-800 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Status */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={editingTask.status || "not started"}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, status: e.target.value })
                }
                className="w-full px-3 py-2 rounded-md border
          bg-white dark:bg-gray-800
          border-gray-300 dark:border-gray-600
          text-gray-800 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="not started">Pending</option>
                <option value="ongoing">On Going</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={editingTask.dueDate || ""}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, dueDate: e.target.value })
                }
                className="w-full px-3 py-2 rounded-md border
          bg-white dark:bg-gray-800
          border-gray-300 dark:border-gray-600
          text-gray-800 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 rounded-md border
          border-gray-400 dark:border-gray-600
          text-gray-700 dark:text-gray-300
          hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>

              <button
                onClick={() => saveEditedTask(editingTask)}
                disabled={saving}
                className="px-4 py-2 rounded-md text-white
          bg-red-500 hover:bg-red-600
          disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
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
