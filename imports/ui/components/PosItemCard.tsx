import React from "react";
import { MenuItem } from "../../../api/MenuItemsCollection";

interface PosItemCardProps {
  item: MenuItem;
  onClick: (item: MenuItem) => void;
  onImageClick?: (e: React.MouseEvent, item: MenuItem) => void;
  onDeleteClick?: (e: React.MouseEvent, itemId: string) => void;
}

export const PosItemCard = ({ 
  item, 
  onClick, 
  onImageClick,
  onDeleteClick 
}: PosItemCardProps) => {
  return (
    <div className="relative">
      {/* Delete button */}
      {onDeleteClick && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick(e, item._id);
          }}
          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center z-10 shadow-md"
        >
          ×
        </button>
      )}
      
      <div 
        className="rounded-2xl shadow-sm bg-white overflow-hidden w-full max-w-[160px] mx-auto cursor-pointer"
        onClick={() => onClick(item)}
      >
        {/* image */}
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-28 object-contain bg-gray-50"
          onClick={(e) => {
            if (onImageClick) {
              e.stopPropagation();
              onImageClick(e, item);
            }
          }}
        />
        
        {/* item info */}
        <div className="bg-rose-100 text-center py-1 px-2">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {item.name}
          </h3>
          <div className="flex justify-center items-center">
            <p className="text-pink-700 font-bold text-sm">
              ${item.price.toFixed(2)}
            </p>
            {item.amount > 0 && (
              <span className="ml-2 bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">
                {item.amount}
              </span>
            )}
          </div>
          {item.category && (
            <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
          )}
        </div>
      </div>
    </div>
  );
};