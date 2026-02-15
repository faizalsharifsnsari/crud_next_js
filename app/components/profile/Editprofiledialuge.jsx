"use client";
import { useState, useEffect } from "react";

export default function EditProfileModal({ isOpen, onClose, user, onSave }) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-96">
        <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="border px-4 py-2 rounded-lg">
            Cancel
          </button>

          <button
            onClick={() => onSave(name)}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
