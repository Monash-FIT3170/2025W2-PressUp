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

export const PosSideMenu = ({ tableNo, items, total, onIncrease, onDecrease }: PosSideMenuProps) => {
  const [openDiscountPopup, setOpenDiscountPopup] = useState(false)
  const [discountPercent, setDiscountPercent] = useState(0) // For the discount % button - final value used
  const [discountPercent2, setDiscountPercent2] = useState('') // For the discount % input field
  const [discountAmount, setDiscountAmount] = useState(0) // For the discount $ button - final value used
  const [discountAmount2, setDiscountAmount2] = useState('') // For the discount $ input field
  const [savedAmount, setSavedAmount] = useState(0)
  const [discountPopupScreen, setDiscountPopupScreen] = useState<'menu' | 'percentage' | 'flat'>('menu');
  const [finalTotal, setFinalTotal] = useState(total);


  useEffect(() => {
    const paymentTotal = total - (total * (discountPercent / 100)) - discountAmount;
    const final = paymentTotal < 0 ? 0 : paymentTotal;
    setFinalTotal(final);
    const saved = total - final;
    setSavedAmount(saved);
  }, [total, discountPercent, discountAmount]);


  const applyPercentDiscount = (percentage: number) => {
    setDiscountPercent(percentage);
    setOpenDiscountPopup(false);
  };

  const applyFlatDiscount = (amount: number) => {
    setDiscountAmount(amount);
    setOpenDiscountPopup(false);
  };

  // Allow 1-100% for discount percentage
  const handleDiscountPercent2Change = (percentage: React.ChangeEvent<HTMLInputElement>) => {
    const discountVal = parseInt(percentage.target.value, 10);
    if (!isNaN(discountVal) && discountVal >= 1 && discountVal <= 100) {
      setDiscountPercent2(discountVal);
    } else {
      setDiscountPercent2('');
    }
  }

  // Allow $0.01-max for discount amount
  const handleDiscountAmount2Change = (amount: React.ChangeEvent<HTMLInputElement>) => {
    const discountVal = amount.target.value;
    const num = parseFloat(discountVal);
    const isValid = !isNaN(num) && num > 0 && /^\d+(\.\d{1,2})?$/.test(discountVal);
    if (isValid) {
      setDiscountAmount2(discountVal);
    }else {
      setDiscountAmount2('');
    }
  }

 const handleDelete = (itemId: Mongo.ObjectID) => {
    onDecrease(itemId); 
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
            {/* Item name */}
            <div className="text-sm font-semibold text-gray-800">
              {item.name}
            </div>

            {/* Controls and price */}
            <div className="flex items-center justify-between">
              {/* Quantity controls */}
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

              {/* Price */}
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
      <div className="bg-press-up-purple text-white p-4 flex-shrink-0">
        {/* Displaying total cost*/}
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-bold">Total</span>
          <span className="text-lg font-bold">${finalTotal.toFixed(2)}</span>
        </div>
      

        {/* Displaying discount infomation*/}
        {discountPercent !== 0 && (
          <div className="flex justify-between items-center mb-2 bg-blue-200 text-black text-sm rounded-lg p-1">
            <span className="text-sm font-bold">Percent Discount: {discountPercent}%</span>
          </div>
        )}

        {discountAmount !== 0 && (
          <div className="flex justify-between items-center mb-2 bg-purple-200 text-black text-sm rounded-lg p-1">
            <span className="text-sm font-bold">Flat Discount: ${discountAmount}</span>
          </div>
        )}

        {savedAmount !== 0 && (
          <div className="flex justify-between items-center mb-2 bg-yellow-200 text-black text-sm rounded-lg p-1">
            <span className="text-sm font-bold">Cost Saved: - ${savedAmount.toFixed(2)}</span>
          </div>
        )}

        {/* Discount button */}
        <button className="w-full bg-[#1e032e] hover:bg-press-up-hover text-[#f3ead0] font-bold py-2 px-4 rounded-full mb-2" onClick={() => {setOpenDiscountPopup(true); setDiscountPopupScreen('menu');}}>
          Discount
        </button>

        {/* Discount Popup */}
        {
          openDiscountPopup && (
          <div>
            {/* Overlay for Popup */}
            <div className="fixed inset-0 bg-gray-700/40 z-40" onClick={() => setOpenDiscountPopup(false)} />
            
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-press-up-purple rounded-2xl z-50 shadow-2xl">
              <div className="flex flex-row justify-between mx-5 my-5">
                <h1 className="font-bold text-2xl text-gray-800">Apply Discount</h1>
                <button className="bg-red-700 rounded-2xl w-8" onClick={()=> {setOpenDiscountPopup(false); setDiscountPopupScreen('menu');}}>X</button>
              </div>

              {/* Discount Popup - Menu */}
              {discountPopupScreen === 'menu' && (
                <div className="w-180 h-108 bg-purple-100 rounded-2xl mx-10 px-8 py-2 mb-10 shadow-md">
                  <div className="px-2 py-4">
                    <div className="flex flex-row justify-between">
                      <span className="font-bold text-2xl text-gray-800 rounded-full py-2">Discount Options</span>
                      {discountPercent !== 0 && (
                        <div className="flex justify-between items-center mb-2 bg-blue-300 text-black text-sm rounded-lg p-2 px-4">
                          <span className="text-sm font-bold">Percentage Discount (%): {discountPercent}%</span>
                        </div>
                      )}
                     {discountAmount !== 0 && (
                        <div className="flex justify-between items-center mb-2 bg-purple-300 text-black text-sm rounded-lg p-2">
                          <span className="text-sm font-bold">Flat Discount ($): ${discountAmount}</span>
                        </div>
                      )}                      
                    </div>
                    <div className="flex flex-col items-center mt-7">
                      <button className="bg-blue-300 hover:bg-blue-200 font-bold text-gray-700 text-xl py-4 rounded text-center w-full my-4 rounded-full shadow-lg" onClick={() => setDiscountPopupScreen('percentage')}>
                        Percentage Discount (%)
                      </button>
                      <button className="bg-purple-400 hover:bg-purple-300 font-bold text-gray-700 text-xl py-4 rounded text-center w-full my-4 rounded-full shadow-lg" onClick={() => setDiscountPopupScreen('flat')}>
                        Flat Discount ($)
                      </button>
                      <div className="flex flex-row w-full justify-between">
                        <button className="bg-orange-700 hover:bg-orange-600 text-white font-bold text-xl py-4 my-4 px-6 rounded-full shadow-lg"
                          onClick={() => {
                            setDiscountPercent(0);
                            setDiscountPercent2('');
                            setOpenDiscountPopup(false);
                          }}>
                          Reset Percentage Discount (%)
                        </button>
                        <button className="bg-orange-700 hover:bg-orange-600 text-white font-bold text-xl py-4 my-4 px-8 rounded-full shadow-lg"
                          onClick={() => {
                            setDiscountAmount(0);
                            setDiscountAmount2('');
                            setOpenDiscountPopup(false);
                          }}>
                          Reset Flat Discount ($)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/*Discount Popup - Percentage Discount */}
              {discountPopupScreen === 'percentage' && (
                <div className="w-180 h-108 bg-blue-100 rounded-2xl mx-10 px-8 py-8 mb-10 shadow-md">
                  <div className="flex flex-row justify-between">
                    <span className="font-bold text-2xl text-black rounded-full whitespace-nowrap">Apply Percentage Discount (%)</span>
                    <button className="text-xl text-white font-bold rounded-full bg-press-up-purple hover:bg-purple-400 px-3 py-2 shadow-md" onClick={() => setDiscountPopupScreen('menu')}>← Back</button>
                  </div>
                  <div className="mt-4">
                    <span className="font-bold text-xl text-gray-700">Select Discount Percentage</span>
                    <div className="grid grid-cols-4 gap-1 my-2">
                      {[5, 10, 25, 50].map((d) => (
                        <button key={d} className="bg-blue-700 hover:bg-blue-600 font-bold text-white text-xl h-18 rounded text-center mx-4 my-2 rounded-full shadow-md" onClick={() => applyPercentDiscount(d)}>
                          {d}%
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col my-8">
                      <span className="mb-2 font-bold text-xl text-gray-700">Enter Discount Percentage (%)</span>
                      <input type="number" min={1} max={100} step={1} value={discountPercent2} onChange={handleDiscountPercent2Change} className="px-4 py-3 w-full text-xl h-12 w-64 bg-white border border-gray-300 text-black rounded focus:outline-none focus:ring-2 focus:ring-pink-300"></input>
                      <button className="bg-blue-700 hover:bg-blue-600 font-bold text-white text-xl py-2 rounded text-center mr-130 my-4 rounded-full shadow-md" onClick={() => applyPercentDiscount(discountPercent2)}>
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/*Discount Popup - Flat Discount */}
              {discountPopupScreen === 'flat' && (
                <div className="w-180 h-108 bg-purple-200 rounded-2xl mx-10 px-8 py-8 mb-10 shadow-md">
                  <div className="flex flex-row justify-between">
                    <span className="font-bold text-2xl text-black rounded-full whitespace-nowrap">Apply Flat Discount ($)</span>
                    <button className="text-xl text-white font-bold rounded-full bg-press-up-purple hover:bg-purple-400 px-3 py-2 shadow-md" onClick={() => setDiscountPopupScreen('menu')}>← Back</button>
                  </div>
                  <div className="mt-4">
                    <span className="font-bold text-xl text-gray-700">Select Discount Amount</span>
                    <div className="grid grid-cols-4 gap-1 my-2">
                      {[5, 10, 15, 20].map((d) => (
                        <button key={d} className="bg-purple-700 hover:bg-purple-600 font-bold text-white text-xl h-18 rounded text-center mx-4 my-2 rounded-full shadow-md" onClick={() => applyFlatDiscount(d)}>
                          ${d}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col my-8">
                      <span className="mb-2 font-bold text-xl text-gray-700">Enter Discount Amount ($)</span>
                      <input type="number" min={0.01} step={0.01} value={discountAmount2} onChange={handleDiscountAmount2Change} className="px-4 py-3 w-full text-xl h-12 w-64 bg-white border border-gray-300 text-black rounded focus:outline-none focus:ring-2 focus:ring-pink-300"></input>
                      <button className="bg-purple-700 hover:bg-purple-600 font-bold text-white text-xl py-2 rounded text-center mr-130 my-4 rounded-full shadow-md" onClick={() => applyFlatDiscount(discountAmount2)}>
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Pay button */}
        <PaymentModal />
      </div>
    </div>
  );
};