import React from "react";
import { Button } from "./interaction/Button";

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
          <Button
            variant="negative"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="positive"
            onClick={onConfirm}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};
