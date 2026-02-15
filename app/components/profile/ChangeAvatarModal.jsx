

"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function ChangeAvatarModal({
  isOpen,
  onClose,
  user,
  onSave,
}) {
  const [image, setImage] = useState("");

  useEffect(() => {
    if (user) {
      setImage(user.image || "");
    }
  }, [user]);

  if (!isOpen) return null;

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative animate-fadeIn">

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg"
      >
        ✕
      </button>

      <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
        Change Avatar
      </h2>

      {/* Image Preview */}
      <div className="flex justify-center mb-6">
        {image ? (
          <Image
            src={image}
            alt="Preview"
            width={110}
            height={110}
            className="rounded-full object-cover ring-4 ring-gray-100"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
            No Image
          </div>
        )}
      </div>

      {/* File Upload */}
      <label className="block w-full">
        <span className="sr-only">Choose avatar</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const previewUrl = URL.createObjectURL(file);
              setImage(previewUrl);
            }
          }}
          className="block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-lg file:border-0
                     file:text-sm file:font-medium
                     file:bg-gray-100 file:text-gray-700
                     hover:file:bg-gray-200 cursor-pointer"
        />
      </label>

      {/* Buttons */}
      <div className="mt-8 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          onClick={() => onSave(image)}
          className="px-4 py-2 rounded-lg bg-black text-white text-sm hover:opacity-90"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
);


}
