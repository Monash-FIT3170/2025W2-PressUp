import React , { useState, useEffect } from "react";
import { MenuItem } from "/imports/api";
import { PaymentModal } from "./PaymentModal";
import { Mongo } from "meteor/mongo";
import { useTracker } from "meteor/react-meteor-data";
import { Order, OrdersCollection } from '/imports/api';


interface PosSideMenuProps {
  tableNo: number;
  items: MenuItem[];
  total: number;
  orderId?: string;
  onIncrease: (itemId: Mongo.ObjectID) => void;
  onDecrease: (itemId: Mongo.ObjectID) => void;
  onDelete: (itemId: Mongo.ObjectID) => void; 
  onUpdateOrder?: (fields: any) => void;
  selectedTable: number;
  setSelectedTable: (tableNo: number) => void;
}

export const PosSideMenu = ({ tableNo, items, total, orderId, onIncrease, onDecrease, onDelete, onUpdateOrder, selectedTable, setSelectedTable }: PosSideMenuProps) => {
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
    if (onUpdateOrder && orderId) {
      const discountedTotal = total - (total * (percentage / 100));
      onUpdateOrder({ discountPercent: percentage, totalPrice: parseFloat(discountedTotal.toFixed(2)) });
    }
  };

  const handleDelete = (itemId: Mongo.ObjectID) => {
    onDelete(itemId);
  };

  // Fetch all orders for dropdown
  const orders: Order[] = useTracker(() => OrdersCollection.find({}, { sort: { tableNo: 1 } }).fetch());

  // Handler for table change
  const handleTableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = parseInt(e.target.value, 10);
    setSelectedTable(selected); // update parent state
  };

  return (
    <div className="w-96 h-140 bg-gray-100 flex flex-col">
      <div className="flex items-center justify-between bg-rose-400 text-white px-4 py-2 rounded-t-md">
        <button className="text-2xl font-bold">⋯</button>
        <select
          className="text-lg font-semibold bg-rose-400 text-white border-none outline-none"
          value={selectedTable}
          onChange={handleTableChange}
        >
          {orders.map((order: Order) => (
            <option key={String(order._id)} value={order.tableNo}>
              Table {order.tableNo}
            </option>
          ))}
        </select>
        <button className="text-2xl font-bold">×</button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4 border-solid border-rose-400 border-4">
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
      <div className="bg-rose-400 text-white p-4 flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-bold">Total</span>
          <span className="text-lg font-bold">${finalTotal.toFixed(2)}</span>
        </div>

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

        {/* Discount + Reset row */}
        <div className="flex space-x-2 mb-2">
          <button
            className="w-[75%] bg-orange-400 hover:bg-orange-300 text-white font-bold py-2 px-4 rounded-full"
            onClick={() => setOpenDiscountPopup(true)}
          >
            Discount
          </button>
          <button
            className="w-[25%] bg-orange-700 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-full"
            onClick={() => {
              setDiscountPercent(0);
              setSavedAmount(0);
              if (onUpdateOrder && orderId) {
                onUpdateOrder({ discountPercent: 0, totalPrice: total });
              }
            }}
          >
            Reset
          </button>
        </div>

        {openDiscountPopup && (
          <div className="fixed w-200 h-130 top-40 left-120 bg-pink-300 rounded-2xl">
            <div className="flex flex-row justify-between mx-5 my-5">
              <h1 className="font-bold text-2xl text-black">Apply Discount</h1>
              <button className="bg-red-700 rounded-2xl w-8" onClick={() => setOpenDiscountPopup(false)}>X</button>
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
        )}

        {/* Pay button */}
        <PaymentModal />
      </div>
    </div>
  );
}