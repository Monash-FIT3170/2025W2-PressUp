import React from "react";
import { MenuItem } from "/imports/api";

interface Props {
  item: MenuItem;
  onClick: (item: MenuItem) => void;
}

export const PosItemCard = ({ item, onClick }: Props) => {
  return (
    <div
      className="rounded-2xl shadow-sm bg-white overflow-hidden w-full max-w-[160px] mx-auto cursor-pointer"
      onClick={() => onClick(item)}
    >
      {/* image */}
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-28 object-contain bg-gray-50"
      />

      {/* item info */}
      <div className="bg-press-up-purple text-center py-1 px-2">
        <h3 className="text-sm font-semibold text-gray-200 truncate">
          {item.name}
        </h3>
        <div className="text-white font-bold text-sm">
          {item.discount && item.discount > 0 && (
            <span className="line-through opacity-60 mr-1">
              ${item.price.toFixed(2)}
            </span>
          )}
          <span>
            $
            {item.discount && item.discount > 0
              ? (item.price * (1 - item.discount / 100)).toFixed(2)
              : item.price.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
