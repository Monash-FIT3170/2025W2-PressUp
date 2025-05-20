import React from "react";
import { MenuItem } from "/imports/api";
import { PaymentModal } from "./PaymentModal";
import { Mongo } from "meteor/mongo";

interface PosSideMenuProps {
  items: MenuItem[];
  total: number;
  onIncrease: (itemId: Mongo.ObjectID) => void;
  onDecrease: (itemId: Mongo.ObjectID) => void;
}

export const PosSideMenu = ({ items, total, onIncrease, onDecrease }: PosSideMenuProps) => {
  return (
    <div className="w-64 bg-gray-100 flex flex-col pb-20 h-screen">
      <div className="flex items-center justify-between bg-rose-400 text-white px-4 py-2 rounded-t-md">
        <button className="text-2xl font-bold">⋯</button>
        <span className="text-lg font-semibold">Table 12</span>
        <button className="text-2xl font-bold">×</button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {items.map((item) => (
          <div
            key={item._id.toString()}
            className="bg-white rounded-md p-3 shadow-sm flex items-center justify-between"
          >
            <div>
              <h3 className="font-semibold text-gray-800">{item.name}</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onDecrease(item._id)}
                className="bg-gray-200 px-2 rounded text-lg"
              >
                −
              </button>
              <span>{item.quantity}</span>
              <button
                onClick={() => onIncrease(item._id)}
                className="bg-gray-200 px-2 rounded text-lg"
              >
                +
              </button>
            </div>
            <div className="font-semibold text-gray-800">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-rose-400 text-white p-4 flex-shrink-0 sticky bottom-0">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold">Total</span>
          <span className="text-lg font-bold">${total.toFixed(2)}</span>
        </div>
        {/* Link Pay button to Receipt page with Payment Modal*/}
        <PaymentModal></PaymentModal>
      </div>
    </div>
  );
};