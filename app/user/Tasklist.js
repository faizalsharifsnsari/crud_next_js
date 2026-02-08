"use client";
import { ClockIcon, PlayIcon, CheckIcon } from "@heroicons/react/24/solid";

import {
  DndContext,
  closestCenter,
  PointerSensor,
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
import { useState } from "react";
import styles from "./user.module.css";

//priority colours
const priorityBg = {
  high: "#FEE2E2", // stronger soft red
  medium: "#FEF3C7", // warm amber
  low: "#DCFCE7", // calm green
};

const priorityBorder = {
  high: "#EF4444",
  medium: "#F59E0B",
  low: "#22C55E",
};

//icon code
function StatusIcon({ status }) {
  const base =
    "w-9 h-9 rounded-full flex items-center justify-center shadow-sm";

  if (status === "completed") {
    return (
      <div className={`${base} bg-green-500 text-white`} title="Completed">
        <CheckIcon className="w-5 h-5" />
      </div>
    );
  }

  if (status === "ongoing") {
    return (
      <div className={`${base} bg-blue-500 text-white`} title="Ongoing">
        <PlayIcon className="w-5 h-5 ml-[1px]" />
      </div>
    );
  }

  return (
    <div className={`${base} bg-gray-400 text-white`} title="Not started">
      <ClockIcon className="w-5 h-5" />
    </div>
  );
}

//update api
const saveEditedTask = async (task) => {
  try {
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

    if (!res.ok) throw new Error("Update failed");

    const data = await res.json();

    // 🔁 Update UI immediately
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, ...data.task } : t)),
    );

    setEditingTask(null); // close dialog
  } catch (err) {
    console.error("Update error:", err);
  }
};

/* ---------------- SORTABLE TASK ---------------- */
function SortableTask({ task, onDelete, onEdit, onView }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: priorityBg[task.priority] || "#ffffff",
    borderLeft: `6px solid ${priorityBorder[task.priority] || "#e5e7eb"}`,
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.task}>
      {/* Left side: status + title */}
      <div className={styles.taskInfo} {...attributes} {...listeners}>
        <StatusIcon status={task.status} />

        <div className="flex items-center justify-between flex-1 px-2">
          <span
            className="
      text-sm font-semibold
      text-gray-800
      truncate
    "
          >
            {task.title}
          </span>

          <button
            className="
    flex items-center justify-center
    w-8 h-8
    rounded-full
    text-gray-500
    hover:text-gray-900
    hover:bg-black/5
    transition
  "
            onClick={(e) => {
              e.stopPropagation();
              onView(task); // ✅ open dialog
            }}
            title="View details"
          >
            👁
          </button>
        </div>
      </div>

      {/* Right side: actions */}
      <div className={styles.taskActions}>
        <button className={styles.edit} onClick={() => onEdit(task)}>
          Edit
        </button>

        <button
          className={styles.delete}
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
  console.log("Tasks received in TaskList:", initialTasks);
  const [tasks, setTasks] = useState(initialTasks);
  const [editingTask, setEditingTask] = useState(null);
  const [viewTask, setViewTask] = useState(null);
  const [loadingViewTask, setLoadingViewTask] = useState(false);

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
          <div className="bg-white rounded-lg shadow-xl w-[400px] max-w-[90%] p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 truncate">
                Task Details
              </h3>
              <button
                className="text-gray-500 hover:text-gray-900"
                onClick={() => setViewTask(null)}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Title */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700">Title:</h4>
              <p className="text-gray-800 font-bold text-base">
                {viewTask.title || "Untitled Task"}
              </p>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700">
                Description:
              </h4>
              <p className="text-gray-600 text-sm whitespace-pre-line">
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
            <div className="mb-4 grid grid-cols-3 gap-4 text-sm text-gray-600">
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
                className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-800 font-medium"
                onClick={() => setViewTask(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {editingTask && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Edit Task</h3>

            {/* Title Field */}
            <div className={styles.field}>
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                value={editingTask.title}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, title: e.target.value })
                }
                placeholder="Enter task title"
              />
            </div>

            {/* Description Field */}
            <div className={styles.field}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={editingTask.description || ""}
                onChange={(e) =>
                  setEditingTask({
                    ...editingTask,
                    description: e.target.value,
                  })
                }
                placeholder="Enter task description"
                rows={4}
              />
            </div>

            {/* Priority Field */}
            <div className={styles.field}>
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={editingTask.priority || "medium"}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, priority: e.target.value })
                }
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Status Field */}
            <div className={styles.field}>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={editingTask.status || "not started"}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, status: e.target.value })
                }
              >
                <option value="not started">Pending</option>
                <option value="ongoing">On Going</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Due Date Field */}
            <div className={styles.field}>
              <label htmlFor="dueDate">Due Date</label>
              <input
                id="dueDate"
                type="date"
                value={editingTask.dueDate || ""}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, dueDate: e.target.value })
                }
              />
            </div>

            {/* Action Buttons */}
            <div className={styles.modalActions}>
              <button
                className={styles.save}
                onClick={() => saveEditedTask(editingTask)}
              >
                Save
              </button>
              <button
                className={styles.cancel}
                onClick={() => setEditingTask(null)}
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
