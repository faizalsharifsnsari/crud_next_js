"use client";
import { useState } from "react";

export default function AddTaskDialog({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [dueDate, setDueDate] = useState("");

  const addProduct = async () => {
    const result = await fetch("/api/products", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        title,
        description,
        priority,
        dueDate,
      }),
    });

    const data = await result.json();
    if (data.success) {
      alert("New task added");
      setTitle("");
      setDescription("");
      setPriority("");
      setDueDate("");
      onClose(); // close dialog after success
    }
  };

 return (

  <div className="fixed inset-0 z-50 flex items-center justify-center">


{/* Overlay */}
<div
  onClick={onClose}
  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
/>

{/* Dialog */}
<div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-2xl border border-gray-200 dark:border-gray-700">

  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
    Add New Task
  </h1>

  <input
    className="w-full mb-4 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
    placeholder="Title"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
  />

  <textarea
    className="w-full mb-4 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
    placeholder="Description"
    rows={4}
    value={description}
    onChange={(e) => setDescription(e.target.value)}
  />

  {/* Priority */}
  <div className="flex gap-3 mb-4">
    {["high", "medium", "low"].map((level) => (
      <label
        key={level}
        className={`flex-1 text-center px-4 py-2 rounded-lg cursor-pointer border transition ${
          priority === level
            ? "bg-emerald-300 border-emerald-400 font-semibold text-gray-900"
            : "border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
        }`}
      >
        <input
          type="radio"
          value={level}
          checked={priority === level}
          onChange={(e) => setPriority(e.target.value)}
          className="hidden"
        />
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </label>
    ))}
  </div>

  <input
    type="date"
    className="w-full mb-6 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
    value={dueDate}
    onChange={(e) => setDueDate(e.target.value)}
  />

  <div className="flex gap-3">

    <button
      onClick={onClose}
      className="w-1/3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
    >
      Cancel
    </button>

    <button
      onClick={addProduct}
      className="w-2/3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition"
    >
      Add Task
    </button>

  </div>

</div>


  </div>
);

}
