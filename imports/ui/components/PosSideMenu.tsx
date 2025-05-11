import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { MenuItem } from "../../api/MenuItemsCollection"; 

interface PosSideMenuProps {
  items: MenuItem[];
}

export const PosSideMenu = ({ items }: PosSideMenuProps) => {
  const [localQuantities, setLocalQuantities] = useState<{ [id: string]: number }>(
    Object.fromEntries(items.map((item) => [String(item._id), item.quantity]))
  );

  const handleQuantityChange = (id: string, change: number) => {
    const newQuantity = Math.max(0, (localQuantities[id] || 0) + change);

    // 1. local UI update
    setLocalQuantities((prev) => ({
      ...prev,
      [id]: newQuantity,
    }));

    // 2. DB update
    Meteor.call("menuItems.updateQuantity", id, change, (error: Meteor.Error | undefined) => {
      if (error) {
        console.error("DB update failed:", error);
      }
    });
  };

  // For discount logic
  const [openDiscountPopup, setOpenDiscountPopup] = useState(false)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [finalTotal, setFinalTotal] = useState(40.00)

  const applyDiscount = (percentage:number) => {
    const discountPercentage = percentage;
    const discountedFinalTotal = finalTotal - (100 * (discountPercentage/100));
    setDiscountPercent(discountPercent);
    setFinalTotal(discountedFinalTotal);
    setOpenDiscountPopup(false);
  };


  return (
    <div className="w-64 bg-gray-100 flex flex-col pb-20 h-screen">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between bg-rose-400 text-white px-4 py-2 rounded-t-md">
        <button className="text-2xl font-bold">⋯</button>
        <span className="text-lg font-semibold">Table 12</span>
        <button className="text-2xl font-bold">×</button>
      </div>

      {/* Scrollable Order List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Now loop through the items */}
        {items.map((item) => (
          <div className="bg-white rounded-md p-3 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">{item.name}</h3>
              {/* <p className="text-xs text-gray-500">{item.size || "-"}</p> assuming there might be a size */}
            </div>
            <div className="flex items-center space-x-2">
            <button
                onClick={() => handleQuantityChange(String(item._id), -1)}
                className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-lg font-bold cursor-pointer"
              >
                –
              </button>
              <span>{localQuantities[String(item._id)] ?? 0}</span>
              <button
                onClick={() => handleQuantityChange(String(item._id), 1)}
                className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-lg font-bold cursor-pointer"
              >
                ＋
              </button>
            </div>
            <div className="font-semibold text-gray-800">
              ${item.price.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Total Cost + Discount Button + Pay Button */}
      <div className="bg-rose-400 text-white p-4 flex-shrink-0 sticky bottom-0">
        {/* Displaying total cost*/}
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold">Total</span>
          <span className="text-lg font-bold">${finalTotal.toFixed(2)}</span> {/* Static total for now */}
        </div>
        
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
            <div className="w-180 h-100 bg-pink-200 rounded-2xl mx-10 p-6">
              <div className="grid grid-cols-3 gap-1">
                {[5, 10, 15, 20, 25, 30, 35, 40, 50].map((d) => (
                  <button key={d} className="bg-pink-700 font-bold text-white h-13 rounded text-center mx-4 my-2 rounded-full" onClick={() => applyDiscount(d)}>
                    {d}%
                  </button>
                ))}
              </div>
            </div>
          </div>
          )
        }

        {/* Pay button*/}
        <button className="w-full bg-pink-700 hover:bg-pink-800 text-white font-bold py-2 px-4 rounded-full">
          Pay
        </button>
      </div>
    </div>
  );
};
