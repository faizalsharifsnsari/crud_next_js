"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function ChangeAvatarModal({ isOpen, onClose, user, onSave }) {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setPreview(user?.image || null);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        // send Cloudinary URL to parent
        await onSave(data.url);
        onClose();
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
          Change Avatar
        </h2>

        {/* Preview */}
        <div className="flex justify-center mb-6">
          {preview && preview.trim() !== "" ? (
            <Image
              src={preview}
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

        {/* File Input */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const selectedFile = e.target.files[0];
            if (selectedFile) {
              setFile(selectedFile);
              setPreview(URL.createObjectURL(selectedFile));
            }
          }}
          className="block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-lg file:border-0
                     file:text-sm file:font-medium
                     file:bg-gray-100 file:text-gray-700
                     hover:file:bg-gray-200 cursor-pointer"
        />

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-black text-white text-sm hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
