import React, { useState, useEffect } from "react";
import { MenuItem } from "/imports/api";
import { PaymentModal } from "./PaymentModal";
import { Mongo } from "meteor/mongo";
import { useTracker } from "meteor/react-meteor-data";
import { Order, OrdersCollection } from "/imports/api";

// Patch: allow originalPrice to be present on order (for discount logic)
type OrderWithOriginal = Order & { originalPrice?: number };

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

export const PosSideMenu = ({
  tableNo,
  items,
  total,
  orderId,
  onIncrease,
  onDecrease,
  onDelete,
  onUpdateOrder,
  selectedTable,
  setSelectedTable,
}: PosSideMenuProps) => {
  // Fetch the current order for this table
  const order: OrderWithOriginal | undefined = useTracker(
    () => OrdersCollection.findOne({ tableNo: selectedTable }),
    [selectedTable]
  );

  // New state for order type
  const [orderType, setOrderType] = useState<"dine-in" | "takeaway">("dine-in");

  // Discount states
  const [discountPercent, setDiscountPercent] = useState(order?.discountPercent || 0);
  const [discountAmount, setDiscountAmount] = useState(order?.discountAmount || 0);
  const [openDiscountPopup, setOpenDiscountPopup] = useState(false);
  const [discountPercent2, setDiscountPercent2] = useState("");
  const [discountAmount2, setDiscountAmount2] = useState("");
  const [savedAmount, setSavedAmount] = useState(0);
  const [discountPopupScreen, setDiscountPopupScreen] =
    useState<"menu" | "percentage" | "flat">("menu");
  const [finalTotal, setFinalTotal] = useState(total);

  const [originalPrice, setOriginalPrice] = useState(total);

  useEffect(() => {
    setDiscountPercent(order?.discountPercent || 0);
    setDiscountAmount(order?.discountAmount || 0);
  }, [order?._id, order?.discountPercent, order?.discountAmount]);

  useEffect(() => {
    if ((order?.discountPercent ?? 0) === 0 && (order?.discountAmount ?? 0) === 0) {
      setOriginalPrice(total);
    } else if (order?.originalPrice) {
      setOriginalPrice(order.originalPrice);
    }
  }, [total, order?._id, order?.originalPrice, order?.discountPercent, order?.discountAmount]);

  useEffect(() => {
    const paymentTotal =
      originalPrice - originalPrice * (discountPercent / 100) - discountAmount;
    const final = paymentTotal < 0 ? 0 : paymentTotal;
    setFinalTotal(final);
    setSavedAmount(originalPrice - final);
  }, [originalPrice, discountPercent, discountAmount]);

  // Discount handlers
  const applyPercentDiscount = (percentage: number) => {
    setDiscountPercent(percentage);
    setOpenDiscountPopup(false);
    if (onUpdateOrder && orderId) {
      const discountedTotal =
        originalPrice - originalPrice * (percentage / 100) - discountAmount;
      onUpdateOrder({
        discountPercent: percentage,
        discountAmount,
        totalPrice: parseFloat(Math.max(0, discountedTotal).toFixed(2)),
        originalPrice,
      });
    }
  };

  const applyFlatDiscount = (amount: number) => {
    setDiscountAmount(amount);
    setOpenDiscountPopup(false);
    if (onUpdateOrder && orderId) {
      const discountedTotal =
        originalPrice - originalPrice * (discountPercent / 100) - amount;
      onUpdateOrder({
        discountPercent,
        discountAmount: amount,
        totalPrice: parseFloat(Math.max(0, discountedTotal).toFixed(2)),
        originalPrice,
      });
    }
  };

  const removePercentDiscount = () => {
    setDiscountPercent(0);
    setDiscountPercent2("");
    setOpenDiscountPopup(false);
    if (onUpdateOrder && orderId) {
      const discountedTotal = originalPrice - discountAmount;
      onUpdateOrder({
        discountPercent: 0,
        discountAmount,
        totalPrice: parseFloat(discountedTotal.toFixed(2)),
        originalPrice,
      });
    }
  };

  const removeFlatDiscount = () => {
    setDiscountAmount(0);
    setDiscountAmount2("");
    setOpenDiscountPopup(false);
    if (onUpdateOrder && orderId) {
      const discountedTotal = originalPrice - originalPrice * (discountPercent / 100);
      onUpdateOrder({
        discountPercent,
        discountAmount: 0,
        totalPrice: parseFloat(discountedTotal.toFixed(2)),
        originalPrice,
      });
    }
  };

  const handleDelete = (itemId: Mongo.ObjectID) => {
    onDelete(itemId);
  };

  // Fetch unpaid orders for dropdown
  const orders: Order[] = useTracker(
    () =>
      OrdersCollection.find({ paid: { $ne: true } }, { sort: { tableNo: 1 } }).fetch(),
    []
  );

  // Fix string→number issue
  const handleTableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Number(e.target.value);
    setSelectedTable(selected);
  };

  return (
    <div className="w-64 h-[75vh] flex flex-col">
      {/* Header */}
      <div className="flex flex-col bg-press-up-purple text-white px-4 py-2 rounded-t-md">
        {/* Toggle buttons */}
        <div className="flex justify-center gap-2 mb-2">
          <button
            onClick={() => setOrderType("dine-in")}
            className={`px-3 py-1 rounded-full font-semibold ${
              orderType === "dine-in"
                ? "bg-white text-press-up-purple"
                : "bg-press-up-purple border border-white"
            }`}
          >
            Dine In
          </button>
          <button
            onClick={() => setOrderType("takeaway")}
            className={`px-3 py-1 rounded-full font-semibold ${
              orderType === "takeaway"
                ? "bg-white text-press-up-purple"
                : "bg-press-up-purple border border-white"
            }`}
          >
            Takeaway
          </button>
        </div>

        {/* Table Dropdown or Takeaway */}
        <div className="flex justify-center items-center relative">
          {orderType === "dine-in" ? (
            <select
              className="text-lg font-semibold bg-press-up-purple text-white border-none outline-none"
              value={selectedTable ?? ""}
              onChange={handleTableChange}
            >
              {orders.length === 0 ? (
                <option value="">No Orders</option>
              ) : (
                orders.map((order: Order) => (
                  <option key={String(order._id)} value={order.tableNo}>
                    Table {order.tableNo}
                  </option>
                ))
              )}
            </select>
          ) : (
            <span className="text-lg font-semibold">Takeaway Order</span>
          )}

          {/* Close button */}
          <button className="text-2xl font-bold absolute right-0">×</button>
        </div>
      </div>
      {/* Items */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4 bg-gray-100 border-solid border-[#6f597b] border-4">
        {items.map((item) => (
          <div
            key={String(item._id)}
            className="bg-white rounded-md p-3 shadow-sm space-y-2"
          >
            <div className="text-sm font-semibold text-gray-800">{item.name}</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onDecrease(item._id)}
                  className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-lg font-bold"
                >
                  –
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => onIncrease(item._id)}
                  className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-lg font-bold"
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
              <div className="text-sm font-semibold text-gray-800">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-press-up-purple text-white p-4 flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-bold">Total</span>
          <span className="text-lg font-bold">${finalTotal.toFixed(2)}</span>
        </div>

        {/* Discount Info */}
        {discountPercent !== 0 && (
          <div className="mb-2 bg-blue-200 text-black text-sm rounded-lg p-1">
            Percent Discount: {discountPercent}%
          </div>
        )}
        {discountAmount !== 0 && (
          <div className="mb-2 bg-purple-200 text-black text-sm rounded-lg p-1">
            Flat Discount: ${discountAmount}
          </div>
        )}
        {savedAmount !== 0 && (
          <div className="mb-2 bg-yellow-200 text-black text-sm rounded-lg p-1">
            Cost Saved: - ${savedAmount.toFixed(2)}
          </div>
        )}

        <button
          className="w-full bg-[#1e032e] hover:bg-press-up-hover text-[#f3ead0] font-bold py-2 px-4 rounded-full mb-2"
          onClick={() => {
            setOpenDiscountPopup(true);
            setDiscountPopupScreen("menu");
          }}
        >
          Discount
        </button>

        {order && <PaymentModal tableNo={selectedTable} order={order} />}
      </div>
    </div>
  );
};
