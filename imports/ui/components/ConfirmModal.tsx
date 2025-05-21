import React from 'react';

interface ConfirmModalProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <div
      className={`
        fixed inset-0 flex justify-center items-center
        transition-colors z-[1000]
        ${open ? "visible bg-black/20" : "invisible"}
      `}
      onClick={onCancel}
    >
      <div
        className={`
          bg-stone-100 dark:bg-neutral-800 rounded-2xl shadow p-6
          transition-all duration-300
          ${open ? "scale-100 opacity-100" : "scale-125 opacity-0"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-lg mb-6 text-center">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium
              bg-gray-300 hover:bg-gray-400
              dark:bg-neutral-600 dark:hover:bg-neutral-700
              transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium
              text-white bg-rose-500 hover:bg-rose-600
              dark:bg-rose-400 dark:hover:bg-rose-500
              transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

