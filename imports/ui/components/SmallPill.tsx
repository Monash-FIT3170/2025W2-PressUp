import React from "react";
import { Cross } from "./symbols/GeneralSymbols";

interface SmallPillProps {
  children: React.ReactNode;
  onClose?: () => void;
  closeTitle?: string;
}

export const SmallPill = ({
  children,
  onClose,
  closeTitle,
}: SmallPillProps) => {
  return (
    <span className="bg-press-up-purple text-white rounded-sm text-xs px-2 py-1 inline-flex items-center">
      {children}
      {onClose && (
        <button
          className="ml-2 cursor-pointer hover:bg-red-600 rounded-full p-1 transition-colors flex items-center justify-center"
          onClick={onClose}
          title={closeTitle}
          style={{ width: "16px", height: "16px" }}
        >
          <Cross height="8px" width="8px" viewBox="0 0 14 14" />
        </button>
      )}
    </span>
  );
};
