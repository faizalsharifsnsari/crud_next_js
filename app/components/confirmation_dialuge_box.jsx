function ConfirmDialog({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="
        relative z-10 w-[90%] max-w-sm
        bg-white dark:bg-gray-800
        rounded-xl shadow-xl
        p-6
        text-center
        border border-gray-200 dark:border-gray-700
      ">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Are you sure you want to delete this task?
        </h2>

        <div className="flex justify-center gap-3 mt-4">
          {/* CANCEL */}
          <button
            onClick={onClose}
            className="
              px-4 py-2 rounded-md text-sm font-medium
              bg-gray-200 hover:bg-gray-300
              dark:bg-gray-700 dark:hover:bg-gray-600
              text-gray-800 dark:text-white
            "
          >
            Cancel
          </button>

          {/* CONFIRM */}
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="
              px-4 py-2 rounded-md text-sm font-medium
              bg-red-500 hover:bg-red-600
              text-white
            "
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}