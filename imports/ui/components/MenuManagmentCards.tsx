import React, { useState } from "react";
import { PosItemCard } from "./PosItemCard";
import { MenuItem } from "/imports/api";
import { ConfirmModal } from "./ConfirmModal";
import { Meteor } from "meteor/meteor";

interface Props {
  item: MenuItem;
  onClick: (item: MenuItem) => void;
  // onDelete: (item: MenuItem) => void; // New prop for delete functionality
}

export const MenuManagementCard = ({ item, onClick }: Props) => {
  // removed: , onDelete from parameters
  // set for confirmation modal
  const [showConfirm, setShowConfirm] = useState(false);

  // when bin icon is clicked
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
  };
  // confirmation modal
  const handleConfirm = () => {
    Meteor.call(
      "menuItems.delete",
      item.name,
      (err: Meteor.Error | undefined) => {
        if (err) {
          alert(`Delete failed: ${err.reason}`);
        }
      },
    );
    setShowConfirm(false);
  };

  return (
    <div className="relative">
      {/* Trashcan icon in top right */}
      <div
        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors z-10"
        onClick={handleDeleteClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-red-500"
        >
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
        </svg>
      </div>
      <ConfirmModal
        open={showConfirm}
        message="Are you sure you want to delete this item?"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
      <PosItemCard item={item} onClick={onClick} />
    </div>
  );
};
