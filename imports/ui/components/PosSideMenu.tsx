import React from "react";
import { MenuItem } from "../../api/MenuItemsCollection"; 

interface PosSideMenuProps {
  items: MenuItem[];
}

export const PosSideMenu = ({ items }: PosSideMenuProps) => {
  return (
    <div className="w-64 bg-gray-100 flex flex-col p-0 h-screen">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between bg-rose-400 text-white px-4 py-2 rounded-t-md">
        <button className="text-2xl font-bold">⋯</button>
        <span className="text-lg font-semibold">Table 12</span>
        <button className="text-2xl font-bold">×</button>
      </div>

      {/* Scrollable Order List */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Now loop through the items */}
        {items.map((item) => (
          <div key={item._id} className="bg-white rounded-md p-3 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">{item.name}</h3>
              <p className="text-xs text-gray-500">{item.size || "-"}</p> {/* assuming there might be a size */}
            </div>
            <div className="flex items-center space-x-2">
              <button className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-lg font-bold">-</button>
              <span>2</span> {/* Hardcoded quantity for now */}
              <button className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-lg font-bold">+</button>
            </div>
            <div className="font-semibold text-gray-800">
              ${item.price.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Total and Pay Button */}
      <div className="bg-rose-400 text-white p-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold">Total</span>
          <span className="text-lg font-bold">$40.00</span> {/* Static total for now */}
        </div>
        <button className="w-full bg-pink-700 hover:bg-pink-800 text-white font-bold py-2 px-4 rounded-full">
          Pay
        </button>
      </div>
    </div>
  );
};
