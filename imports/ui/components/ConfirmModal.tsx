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
        <p className="text-black dark:text-white mb-6 text-center">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium
              text-black bg-gray-300 hover:bg-gray-400
              bg-neutral-600 hover:bg-neutral-700 text-white
              transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium
              text-black bg-press-up-purple hover:bg-press-up-navy
              bg-press-up-purple hover:bg-press-up-purple text-white
              transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

