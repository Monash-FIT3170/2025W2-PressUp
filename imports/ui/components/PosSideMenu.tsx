import React , { useState, useEffect } from "react";
import { MenuItem } from "/imports/api";
import { PaymentModal } from "./PaymentModal";
import { Mongo } from "meteor/mongo";


interface PosSideMenuProps {
  tableNo: number;
  items: MenuItem[];
  total: number;
  onIncrease: (itemId: Mongo.ObjectID) => void;
  onDecrease: (itemId: Mongo.ObjectID) => void;
  onDelete: (itemId: Mongo.ObjectID) => void;
}

export const PosSideMenu = ({ tableNo, items, total, onIncrease, onDecrease, onDelete }: PosSideMenuProps) => {
  const [openDiscountPopup, setOpenDiscountPopup] = useState(false)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [savedAmount, setSavedAmount] = useState(0)

  // Recalculate saved amount when total or discount changes
  const finalTotal = total - (total * (discountPercent / 100));

  useEffect(() => {
    const saved = total - finalTotal;
    setSavedAmount(saved);
  }, [total, discountPercent]);

  const applyDiscount = (percentage: number) => {
    setDiscountPercent(percentage);
    setOpenDiscountPopup(false);
  };

  const handleDelete = (itemId: Mongo.ObjectID) => {
    onDelete(itemId);
  };

  return (
    <div className="w-64 bg-gray-100 flex flex-col h-screen">
      <div className="flex items-center justify-between bg-press-up-purple text-white px-4 py-2 rounded-t-md">

        <button className="text-2xl font-bold">⋯</button>
        <span className="text-lg font-semibold">Table {tableNo}</span>
        <button className="text-2xl font-bold">×</button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4 border-solid border-[#6f597b] border-4">
        {items.map((item) => (
          <div
            key={String(item._id)}
            className="bg-white rounded-md p-3 shadow-sm space-y-2"
          >
            <div className="text-sm font-semibold text-gray-800">
              {item.name}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onDecrease(item._id)}
                  className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-lg font-bold"
                >
                  –
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => onIncrease(item._id)}
                  className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-lg font-bold"
                >
                  ＋
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="text-red-500 hover:text-red-700 text-lg font-bold"
                  title="Remove item"
                >
                  🗑
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <div className="text-sm font-semibold text-gray-800">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Cost + Discount Button + Pay Button */}
      <div className="bg-press-up-purple text-white p-4 flex-shrink-0 sticky bottom-0">
        {/* Displaying total cost*/}

        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-bold">Total</span>
          <span className="text-lg font-bold">${finalTotal.toFixed(2)}</span>
        </div>

        {discountPercent !== 0 && (
          <div>
            <div className="flex justify-between items-center mb-2 bg-press-up-light-purple text-white text-sm rounded-lg p-1">
              <span className="text-sm font-bold">Last Discount Applied</span>
              <span className="text-sm font-bold">{discountPercent}%</span>
            </div>
            <div className="flex justify-between items-center mb-2 bg-press-up-light-purple text-white text-sm rounded-lg p-1">
              <span className="text-sm font-bold">Total Discount</span>
              <span className="text-sm font-bold">- ${savedAmount.toFixed(2)}</span>
            </div>
          </div>
        )}


        {/* Discount + Reset row */}
        <div className="flex space-x-2 mb-2">
          <button
            className="w-full bg-[#1e032e] hover:bg-press-up-hover text-[#f3ead0] font-bold py-2 px-4 rounded-full"
            onClick={() => setOpenDiscountPopup(true)}
          >
            Discount
          </button>
          <button
            className="w-full bg-[#1e032e] hover:bg-press-up-hover text-[#f3ead0] font-bold py-2 px-4 rounded-full"
            onClick={() => {
              setDiscountPercent(0);
              setSavedAmount(0);
            }}
          >
            Reset
          </button>
        </div>

        {openDiscountPopup && (
          <div className="fixed w-200 h-130 top-40 left-120 bg-press-up-purple rounded-2xl">
            <div className="flex flex-row justify-between mx-5 my-5">
              <h1 className="text-2xl text-white">Select Discount</h1>
              <button className="rounded-2xl w-8 text-white text-2xl" onClick={()=> setOpenDiscountPopup(false)}>X</button>
            </div>
            <div className="w-190 h-80 bg-press-up-grey rounded-2xl mx-5 p-8">
              <span className="font-bold text-xl text-press-up-purple">Select Discount Percentage</span>
              <div className="grid grid-cols-4 gap-1 my-4">
                {[5, 10, 25, 50].map((d) => (
                  <button key={d} className="bg-press-up-positive-button hover:bg-press-up-hover font-bold text-white text-xl h-18 rounded text-center mx-4 my-2 rounded-full" onClick={() => applyDiscount(d)}>
                    {d}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Pay button */}
        <PaymentModal />

      </div>
    </div>
  );
}