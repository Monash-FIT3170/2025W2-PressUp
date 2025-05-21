import React , { useState } from "react";
import { MenuItem } from "/imports/api";
import { PaymentModal } from "./PaymentModal";
import { Mongo } from "meteor/mongo";

interface PosSideMenuProps {
  tableNo: number;
  items: MenuItem[];
  total: number;
  onIncrease: (itemId: Mongo.ObjectID) => void;
  onDecrease: (itemId: Mongo.ObjectID) => void;
}

export const PosSideMenu = ({ tableNo, items, total, onIncrease, onDecrease }: PosSideMenuProps) => {
  const [openDiscountPopup, setOpenDiscountPopup] = useState(false)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [originalTotal, setOriginalTotal] = useState(total)
  const [finalTotal, setFinalTotal] = useState(total)
  const [savedAmount, setSavedAmount] = useState(0)

  const applyDiscount = (percentage:number) => {
    const discountPercentage = percentage;
    const discountedFinalTotal = total - (total * (discountPercentage/100));
    const savedCost = total - discountedFinalTotal;
    setDiscountPercent(discountPercentage);
    setFinalTotal(discountedFinalTotal);
    setSavedAmount(savedCost);
    setOpenDiscountPopup(false);
  };
  return (
    <div className="w-64 bg-gray-100 flex flex-col h-screen">
      <div className="flex items-center justify-between bg-rose-400 text-white px-4 py-2 rounded-t-md">
        <button className="text-2xl font-bold">⋯</button>
        <span className="text-lg font-semibold">Table {tableNo}</span>
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

      {/* Total Cost + Discount Button + Pay Button */}
      <div className="bg-rose-400 text-white p-4 flex-shrink-0 sticky bottom-0">
        {/* Displaying total cost*/}
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-bold">Total</span>
          <span className="text-lg font-bold">${total.toFixed(2)}</span>
        </div>
        
        {/* Shows how much discount is applied*/}
        {discountPercent !== 0 && (
          <div>
            <div className="flex justify-between items-center mb-2 bg-yellow-400 text-black text-sm rounded-lg p-1">
              <span className="text-sm font-bold">Last Discount Applied</span>
              <span className="text-sm font-bold">{discountPercent}%</span>
            </div>
            <div className="flex justify-between items-center mb-2 bg-yellow-200 text-black text-sm rounded-lg p-1">
              <span className="text-sm font-bold">Cost Saved</span>
              <span className="text-sm font-bold">- ${savedAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Discount button + popup*/}
        <button className="w-full bg-orange-400 hover:bg-orange-300 text-white font-bold py-2 px-4 mb-2 rounded-full" onClick={() => setOpenDiscountPopup(true)}>
          Discount
        </button>

        {
          openDiscountPopup && (
          <div className="fixed w-200 h-130 top-40 left-120 bg-pink-300 rounded-2xl">

            <div className="flex flex-row justify-between mx-5 my-5">
              <h1 className="font-bold text-2xl text-black">Apply Discount</h1>
              <button className="bg-red-700 rounded-2xl w-8" onClick={()=> setOpenDiscountPopup(false)}>X</button>
            </div>

            <div className="w-180 h-100 bg-pink-200 rounded-2xl mx-10 p-8">
              <span className="font-bold text-xl text-gray-700">Select Discount Percentage</span>
              <div className="grid grid-cols-4 gap-1 my-4">
                {[5, 10, 25, 50].map((d) => (
                  <button key={d} className="bg-pink-700 font-bold text-white text-xl h-18 rounded text-center mx-4 my-2 rounded-full" onClick={() => applyDiscount(d)}>
                    {d}%
                  </button>
                ))}
              </div>
            </div>
          </div>
          )
        }
        {/* Reset Button */}
        <button className="w-full bg-orange-700 hover:bg-orange-600 text-white font-bold py-2 px-4 mb-2 rounded-full"
          onClick={() => {
            setDiscountPercent(0);
            setFinalTotal(total); 
            setSavedAmount(0); 
          }}>
          Reset
        </button>
        
        {/* Link Pay button to Receipt page with Payment Modal*/}
        <PaymentModal></PaymentModal>
      </div>
    </div>
  );
};