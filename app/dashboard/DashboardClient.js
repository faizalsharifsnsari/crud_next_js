"use client";
import { useState } from "react";

export default function DashboardClient() {
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
    }
  };

  return (
  <main
    className="
      min-h-screen
      flex items-center justify-center px-6
      bg-gradient-to-br from-emerald-100 via-emerald-50 to-amber-50
    "
  >
    <div
      className="
        w-full max-w-xl
        rounded-2xl
        bg-white/90 backdrop-blur
        shadow-2xl
        border border-emerald-200
        p-8
      "
    >
      <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Add New Task
      </h1>

      {/* Title */}
      <input
        className="
          w-full mb-4 rounded-lg
          border border-gray-300
          px-4 py-2
          focus:outline-none focus:ring-2 focus:ring-emerald-300
        "
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Description */}
      <textarea
        className="
          w-full mb-4 rounded-lg
          border border-gray-300
          px-4 py-2
          focus:outline-none focus:ring-2 focus:ring-emerald-300
        "
        placeholder="Description"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Priority */}
      <div className="flex gap-3 mb-4">
        {/* High */}
        <label
          className={`
            flex-1 text-center px-4 py-2 rounded-lg cursor-pointer
            border transition
            ${
              priority === "high"
                ? "bg-rose-300 border-rose-400 text-rose-900 font-semibold"
                : "border-gray-300 hover:bg-rose-50"
            }
          `}
        >
          <input
            type="radio"
            value="high"
            checked={priority === "high"}
            onChange={(e) => setPriority(e.target.value)}
            className="hidden"
          />
          High
        </label>

        {/* Medium */}
        <label
          className={`
            flex-1 text-center px-4 py-2 rounded-lg cursor-pointer
            border transition
            ${
              priority === "medium"
                ? "bg-amber-300 border-amber-400 text-amber-900 font-semibold"
                : "border-gray-300 hover:bg-amber-50"
            }
          `}
        >
          <input
            type="radio"
            value="medium"
            checked={priority === "medium"}
            onChange={(e) => setPriority(e.target.value)}
            className="hidden"
          />
          Medium
        </label>

        {/* Low */}
        <label
          className={`
            flex-1 text-center px-4 py-2 rounded-lg cursor-pointer
            border transition
            ${
              priority === "low"
                ? "bg-emerald-300 border-emerald-400 text-emerald-900 font-semibold"
                : "border-gray-300 hover:bg-emerald-50"
            }
          `}
        >
          <input
            type="radio"
            value="low"
            checked={priority === "low"}
            onChange={(e) => setPriority(e.target.value)}
            className="hidden"
          />
          Low
        </label>
      </div>

      {/* Due Date */}
      <input
        type="date"
        className="
          w-full mb-6 rounded-lg
          border border-gray-300
          px-4 py-2
          focus:outline-none focus:ring-2 focus:ring-emerald-300
        "
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      {/* CTA */}
      <button
        onClick={addProduct}
        className="
          w-full py-3 rounded-xl
          bg-emerald-500 text-white
          font-semibold
          hover:bg-emerald-600
          active:scale-[0.98]
          transition
          shadow-md
        "
      >
        Add Task
      </button>
    </div>
  </main>
);

}
