import React from "react";
import { PosItem } from "/imports/api/pos_items";

interface Props {
    item: PosItem;
}

export const PosItemCard = ({ item }: Props) => {
    return (
      <div className="rounded-xl shadow-md bg-white text-center p-2">
        {/* image */}
        <img src={item.imageUrl} alt={item.name} className="w-24 h-24 mx-auto" />
        
        {/* menu */}
        <h3 className="text-lg mt-2">{item.name}</h3>
        
        {/* price (up to 2 decimal point) */}
        <p className="text-pink-700 font-bold">${item.price.toFixed(2)}</p>
      </div>
    );
  };