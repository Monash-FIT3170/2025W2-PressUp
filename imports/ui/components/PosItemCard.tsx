import React from "react";
import { MenuItem } from "/imports/api";

interface Props {
    item: MenuItem;
    onClick: (item: MenuItem) => void;
}

export const PosItemCard = ({ item, onClick }: Props) => {
    return (
      <div className="rounded-2xl shadow-sm bg-white overflow-hidden w-full max-w-[160px] mx-auto cursor-pointer"
          onClick={() => onClick(item)}
      >
        {/* image */}
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-28 object-contain bg-gray-50"
        />
  
        {/* item info */}
        <div className="bg-rose-100 text-center py-1 px-2">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {item.name}
          </h3>
          <p className="text-pink-700 font-bold text-sm">
            ${item.price.toFixed(2)}
          </p>
        </div>
      </div>
    );
  };
