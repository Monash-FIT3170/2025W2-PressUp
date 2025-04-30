import React from "react";
import { MenuItem } from "../../api/MenuItemsCollection"; 

interface PosSideMenuProps {
  items: MenuItem[];
  onUpdateQuantity?: (itemId: string, change: number) => void;
}

export const PosSideMenu = ({ items, onUpdateQuantity }: PosSideMenuProps) => {
  // Calculate total price of all items
  const total = items.reduce((sum, item) => sum + (item.price * item.amount), 0);

  // Handler for increasing/decreasing item quantity
  const handleQuantityChange = (itemId: string, change: number) => {
    if (onUpdateQuantity) {
      onUpdateQuantity(itemId, change);
    }
  };

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
        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No items added to order
          </div>
        ) : (
          items.map((item) => (
            <div key={item._id} className="bg-white rounded-md p-3 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-xs text-gray-500">{item.category}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-lg font-bold"
                  onClick={() => handleQuantityChange(item._id, -1)}
                  disabled={item.amount <= 1}
                >
                  -
                </button>
                <span>{item.amount}</span>
                <button 
                  className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-lg font-bold"
                  onClick={() => handleQuantityChange(item._id, 1)}
                >
                  +
                </button>
              </div>
              <div className="font-semibold text-gray-800">
                ${(item.price * item.amount).toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Total and Pay Button */}
      <div className="bg-rose-400 text-white p-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold">Total</span>
          <span className="text-lg font-bold">${total.toFixed(2)}</span>
        </div>
        <button 
          className="w-full bg-pink-700 hover:bg-pink-800 text-white font-bold py-2 px-4 rounded-full"
          disabled={items.length === 0}
        >
          Pay
        </button>
      </div>
    </div>
  );
};