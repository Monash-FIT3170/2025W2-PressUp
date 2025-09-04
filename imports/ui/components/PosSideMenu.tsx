import React, { useState, useEffect } from "react";
import { MenuItem } from "/imports/api";
import { OrderMenuItem } from "/imports/api/orders/OrdersCollection";
import { PaymentModal } from "./PaymentModal";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { Order, OrdersCollection } from "/imports/api";
import { Meteor } from "meteor/meteor";
import { IdType } from "/imports/api/database";
import { Roles } from "meteor/alanning:roles";
import { RoleEnum } from "/imports/api/accounts/roles";
import { Hide } from "./display/Hide";

interface PosSideMenuProps {
  tableNo: number | null;
  items: (MenuItem | OrderMenuItem)[];
  total: number;
  orderId?: string;
  onIncrease: (itemId: IdType) => void;
  onDecrease: (itemId: IdType) => void;
  onDelete: (itemId: IdType) => void;
  onUpdateOrder?: (fields: Partial<Order>) => void;
  selectedTable: number | null;
  setSelectedTable: (tableNo: number) => void;
}

export const PosSideMenu = ({
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
  useSubscribe("orders");
  const order = useTracker(
    () =>
      selectedTable != null
        ? OrdersCollection.find({ tableNo: selectedTable }).fetch()[0]
        : undefined,
    [selectedTable],
  );

  // New state for order type (dine-in/takeaway)
  const [orderType, setOrderType] = useState<"dine-in" | "takeaway">("dine-in");

  // Discount states
  const [discountPercent, setDiscountPercent] = useState(
    order?.discountPercent || 0,
  );
  const [discountAmount, setDiscountAmount] = useState(
    order?.discountAmount || 0,
  );
  const [openDiscountPopup, setOpenDiscountPopup] = useState(false);
  const [discountPercent2, setDiscountPercent2] = useState(""); // For the discount % input field
  const [discountAmount2, setDiscountAmount2] = useState(""); // For the discount $ input field
  const [savedAmount, setSavedAmount] = useState(0);
  const [discountPopupScreen, setDiscountPopupScreen] = useState<
    "menu" | "percentage" | "flat"
  >("menu");
  const [finalTotal, setFinalTotal] = useState(total);

  // Store original price in state, and always use it for discount calculations
  const [originalPrice, setOriginalPrice] = useState(total);

  useEffect(() => {
    setDiscountPercent(order?.discountPercent || 0);
    setDiscountAmount(order?.discountAmount || 0);
  }, [order?._id, order?.discountPercent, order?.discountAmount]);

  useEffect(() => {
    // When the order or total changes, update the original price ONLY if this order has no discount
    if (
      (order?.discountPercent ?? 0) === 0 &&
      (order?.discountAmount ?? 0) === 0
    ) {
      setOriginalPrice(total);
    } else if (order?.originalPrice) {
      setOriginalPrice(order.originalPrice);
    }
  }, [
    total,
    order?._id,
    order?.originalPrice,
    order?.discountPercent,
    order?.discountAmount,
  ]);

  useEffect(() => {
    // Always calculate discounts from originalPrice
    const paymentTotal =
      originalPrice - originalPrice * (discountPercent / 100) - discountAmount;
    const final = paymentTotal < 0 ? 0 : paymentTotal;
    setFinalTotal(final);
    const saved = originalPrice - final;
    setSavedAmount(saved);
  }, [originalPrice, discountPercent, discountAmount]);

  // Discount handlers
  const applyPercentDiscount = (percentage: number | string) => {
    if (order?.isLocked) return;
    const percent =
      typeof percentage === "string" ? parseInt(percentage, 10) : percentage;
    if (isNaN(percent) || percent < 1 || percent > 100) return;
    setDiscountPercent(percent);
    setOpenDiscountPopup(false);
    if (onUpdateOrder && orderId) {
      const discountedTotal =
        originalPrice - originalPrice * (percent / 100) - discountAmount;
      onUpdateOrder({
        discountPercent: percent,
        discountAmount,
        totalPrice: parseFloat(Math.max(0, discountedTotal).toFixed(2)),
        originalPrice,
      });
    }
  };

  const applyFlatDiscount = (amount: number | string) => {
    if (order?.isLocked) return;
    const amt = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(amt) || amt <= 0) return;
    setDiscountAmount(amt);
    setOpenDiscountPopup(false);
    if (onUpdateOrder && orderId) {
      const discountedTotal =
        originalPrice - originalPrice * (discountPercent / 100) - amt;
      onUpdateOrder({
        discountPercent,
        discountAmount: amt,
        totalPrice: parseFloat(Math.max(0, discountedTotal).toFixed(2)),
        originalPrice,
      });
    }
  };

  // Allow 1-100% for discount percentage
  const handleDiscountPercent2Change = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const discountVal = parseInt(e.target.value, 10);
    if (!isNaN(discountVal) && discountVal >= 1 && discountVal <= 100) {
      setDiscountPercent2(discountVal.toString());
    } else {
      setDiscountPercent2("");
    }
  };

  // Allow $0.01-max for discount amount
  const handleDiscountAmount2Change = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const discountVal = e.target.value;
    const num = parseFloat(discountVal);
    const isValid =
      !isNaN(num) && num > 0 && /^\d+(\.\d{1,2})?$/.test(discountVal);
    if (isValid) {
      setDiscountAmount2(discountVal);
    } else {
      setDiscountAmount2("");
    }
  };

  const removePercentDiscount = () => {
    if (order?.isLocked) return;
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
    if (order?.isLocked) return;
    setDiscountAmount(0);
    setDiscountAmount2("");
    setOpenDiscountPopup(false);
    if (onUpdateOrder && orderId) {
      const discountedTotal =
        originalPrice - originalPrice * (discountPercent / 100);
      onUpdateOrder({
        discountPercent,
        discountAmount: 0,
        totalPrice: parseFloat(discountedTotal.toFixed(2)),
        originalPrice,
      });
    }
  };

  const handleDelete = (itemId: IdType) => {
    onDelete(itemId);
  };

  // Fetch unpaid orders for dropdown
  const orders: Order[] = useTracker(
    () =>
      OrdersCollection.find(
        { paid: { $ne: true } },
        { sort: { tableNo: 1 } },
      ).fetch(),
    [],
  );

  // Table change handler
  const handleTableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Number(e.target.value);
    setSelectedTable(selected);
  };

  const rolesLoaded = useSubscribe("users.roles")();
  const rolesGraphLoaded = useSubscribe("users.rolesGraph")();
  const canLockOrder = useTracker(
    () => Roles.userIsInRole(Meteor.userId(), [RoleEnum.MANAGER]),
    [rolesLoaded, rolesGraphLoaded],
  );

  return (
    <div className="w-64 h-[75vh] flex flex-col">
      {/* Header */}
      <div className="flex flex-col bg-press-up-purple text-white px-4 py-2 rounded-t-md">
        {/* Toggle buttons */}
        <div className="flex justify-center gap-2 mb-2 relative">
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

          {/* Lock button (managers only) */}
          <Hide hide={!canLockOrder}>
            <button
              className="text-2xl font-bold absolute right-0"
              onClick={async () => {
                if (!order?._id) return;
                await new Promise((resolve, reject) => {
                  Meteor.call(
                    "orders.setLocked",
                    order._id,
                    !order.isLocked,
                    (err: any) => (err ? reject(err) : resolve(undefined)),
                  );
                });
              }}
              title={order?.isLocked ? "Unlock order" : "Lock order"}
            >
              {order?.isLocked ? "🔒" : "🔓"}
            </button>
          </Hide>
        </div>
      </div>
      {/* Items + Footer (wrapped so we can overlay when locked) */}
      <div className="relative flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-2 space-y-4 bg-gray-100 border-solid border-[#6f597b] border-4">
          {items.map((item, idx) => {
            // Type guard to detect _id
            function hasIdProp(x: unknown): x is { _id: IdType } {
              return (
                typeof x === "object" &&
                x !== null &&
                "_id" in (x as object) &&
                (x as Record<string, unknown>)["_id"] != null
              );
            }

            const itemId = hasIdProp(item) ? item._id : undefined;
            const qty = item.quantity ?? 1;
            const price = item.price;
            const key = itemId ?? `${item.name}-${idx}`;

            return (
              <div
                key={String(key)}
                className="bg-white rounded-md p-3 shadow-sm space-y-2"
              >
                <div className="text-sm font-semibold text-gray-800">
                  {item.name}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => itemId && onDecrease(itemId)}
                      className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-lg font-bold"
                      title="Decrease Item"
                      disabled={Boolean(order?.isLocked)}
                    >
                      –
                    </button>
                    <span className="px-2">{qty}</span>
                    <button
                      onClick={() => itemId && onIncrease(itemId)}
                      className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-lg font-bold"
                      title="Increase Item"
                      disabled={Boolean(order?.isLocked)}
                    >
                      ＋
                    </button>

                    <button
                      onClick={() => itemId && handleDelete(itemId)}
                      className="text-red-500 hover:text-red-700 text-lg font-bold"
                      title="Remove Item"
                      disabled={Boolean(order?.isLocked)}
                    >
                      🗑
                    </button>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">
                    ${(price * qty).toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-press-up-purple text-white p-4 flex-shrink-0">
          {/* Displaying total cost*/}
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-bold">Total</span>
            <span className="text-lg font-bold">${finalTotal.toFixed(2)}</span>
          </div>

          {/* Displaying discount infomation*/}
          {discountPercent !== 0 && (
            <div className="flex justify-between items-center mb-2 bg-blue-200 text-black text-sm rounded-lg p-1">
              <span className="text-sm font-bold">
                Percent Discount: {discountPercent}%
              </span>
            </div>
          )}
          {discountAmount !== 0 && (
            <div className="flex justify-between items-center mb-2 bg-purple-200 text-black text-sm rounded-lg p-1">
              <span className="text-sm font-bold">
                Flat Discount: ${discountAmount}
              </span>
            </div>
          )}
          {savedAmount !== 0 && (
            <div className="flex justify-between items-center mb-2 bg-yellow-200 text-black text-sm rounded-lg p-1">
              <span className="text-sm font-bold">
                Cost Saved: - ${savedAmount.toFixed(2)}
              </span>
            </div>
          )}

          {/* Discount button */}
          <button
            className="w-full bg-[#1e032e] hover:bg-press-up-hover text-[#f3ead0] font-bold py-2 px-4 rounded-full mb-2"
            onClick={() => {
              if (order?.isLocked) return;
              setOpenDiscountPopup(true);
              setDiscountPopupScreen("menu");
            }}
            disabled={Boolean(order?.isLocked)}
          >
            Discount
          </button>

          {/* Discount Popup */}
          {openDiscountPopup && (
            <div>
              {/* Overlay for Popup */}
              <div
                className="fixed inset-0 bg-gray-700/40 z-40"
                onClick={() => setOpenDiscountPopup(false)}
              />
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-press-up-purple rounded-2xl z-50 shadow-2xl">
                <div className="flex flex-row justify-between mx-5 my-5">
                  <h1 className="font-bold text-2xl text-gray-800">
                    Apply Discount
                  </h1>
                  <button
                    className="bg-red-700 rounded-2xl w-8"
                    onClick={() => {
                      setOpenDiscountPopup(false);
                      setDiscountPopupScreen("menu");
                    }}
                  >
                    X
                  </button>
                </div>
                {/* Discount Popup - Menu */}
                {discountPopupScreen === "menu" && (
                  <div className="w-180 h-108 bg-purple-100 rounded-2xl mx-10 px-8 py-2 mb-10 shadow-md">
                    <div className="px-2 py-4">
                      <div className="flex flex-row justify-between">
                        <span className="font-bold text-2xl text-gray-800 rounded-full py-2">
                          Discount Options
                        </span>
                        {discountPercent !== 0 && (
                          <div className="flex justify-between items-center mb-2 bg-blue-300 text-black text-sm rounded-lg p-2 px-4">
                            <span className="text-sm font-bold">
                              Percentage Discount (%): {discountPercent}%
                            </span>
                          </div>
                        )}
                        {discountAmount !== 0 && (
                          <div className="flex justify-between items-center mb-2 bg-purple-300 text-black text-sm rounded-lg p-2">
                            <span className="text-sm font-bold">
                              Flat Discount ($): ${discountAmount}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-center mt-7">
                        <button
                          className="bg-blue-300 hover:bg-blue-200 font-bold text-gray-700 text-xl py-4 rounded text-center w-full my-4 rounded-full shadow-lg"
                          onClick={() => setDiscountPopupScreen("percentage")}
                        >
                          Percentage Discount (%)
                        </button>
                        <button
                          className="bg-purple-400 hover:bg-purple-300 font-bold text-gray-700 text-xl py-4 rounded text-center w-full my-4 rounded-full shadow-lg"
                          onClick={() => setDiscountPopupScreen("flat")}
                        >
                          Flat Discount ($)
                        </button>
                        <div className="flex flex-row w-full justify-between">
                          <button
                            className="bg-orange-700 hover:bg-orange-600 text-white font-bold text-xl py-4 my-4 px-6 rounded-full shadow-lg"
                            onClick={() => {
                              removePercentDiscount();
                            }}
                          >
                            Reset Percentage Discount (%)
                          </button>
                          <button
                            className="bg-orange-700 hover:bg-orange-600 text-white font-bold text-xl py-4 my-4 px-8 rounded-full shadow-lg"
                            onClick={() => {
                              removeFlatDiscount();
                            }}
                          >
                            Reset Flat Discount ($)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Discount Popup - Percentage Discount */}
                {discountPopupScreen === "percentage" && (
                  <div className="w-180 h-108 bg-blue-100 rounded-2xl mx-10 px-8 py-8 mb-10 shadow-md">
                    <div className="flex flex-row justify-between">
                      <span className="font-bold text-2xl text-black rounded-full whitespace-nowrap">
                        Apply Percentage Discount (%)
                      </span>
                      <button
                        className="text-xl text-white font-bold rounded-full bg-press-up-purple hover:bg-purple-400 px-3 py-2 shadow-md"
                        onClick={() => setDiscountPopupScreen("menu")}
                      >
                        ← Back
                      </button>
                    </div>
                    <div className="mt-4">
                      <span className="font-bold text-xl text-gray-700">
                        Select Discount Percentage
                      </span>
                      <div className="grid grid-cols-4 gap-1 my-2">
                        {[5, 10, 25, 50].map((d) => (
                          <button
                            key={d}
                            className="bg-blue-700 hover:bg-blue-600 font-bold text-white text-xl h-18 rounded text-center mx-4 my-2 rounded-full shadow-md"
                            onClick={() => applyPercentDiscount(d)}
                          >
                            {d}%
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-col my-8">
                        <span className="mb-2 font-bold text-xl text-gray-700">
                          Enter Discount Percentage (%)
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          step={1}
                          value={discountPercent2}
                          onChange={handleDiscountPercent2Change}
                          className="px-4 py-3 w-full text-xl h-12 w-64 bg-white border border-gray-300 text-black rounded focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />
                        <button
                          className="bg-blue-700 hover:bg-blue-600 font-bold text-white text-xl py-2 rounded text-center mr-130 my-4 rounded-full shadow-md"
                          onClick={() => applyPercentDiscount(discountPercent2)}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Discount Popup - Flat Discount */}
                {discountPopupScreen === "flat" && (
                  <div className="w-180 h-108 bg-purple-200 rounded-2xl mx-10 px-8 py-8 mb-10 shadow-md">
                    <div className="flex flex-row justify-between">
                      <span className="font-bold text-2xl text-black rounded-full whitespace-nowrap">
                        Apply Flat Discount ($)
                      </span>
                      <button
                        className="text-xl text-white font-bold rounded-full bg-press-up-purple hover:bg-purple-400 px-3 py-2 shadow-md"
                        onClick={() => setDiscountPopupScreen("menu")}
                      >
                        ← Back
                      </button>
                    </div>
                    <div className="mt-4">
                      <span className="font-bold text-xl text-gray-700">
                        Select Discount Amount
                      </span>
                      <div className="grid grid-cols-4 gap-1 my-2">
                        {[5, 10, 15, 20].map((d) => (
                          <button
                            key={d}
                            className="bg-purple-700 hover:bg-purple-600 font-bold text-white text-xl h-18 rounded text-center mx-4 my-2 rounded-full shadow-md"
                            onClick={() => applyFlatDiscount(d)}
                          >
                            ${d}
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-col my-8">
                        <span className="mb-2 font-bold text-xl text-gray-700">
                          Enter Discount Amount ($)
                        </span>
                        <input
                          type="number"
                          min={0.01}
                          step={0.01}
                          value={discountAmount2}
                          onChange={handleDiscountAmount2Change}
                          className="px-4 py-3 w-full text-xl h-12 w-64 bg-white border border-gray-300 text-black rounded focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />
                        <button
                          className="bg-purple-700 hover:bg-purple-600 font-bold text-white text-xl py-2 rounded text-center mr-130 my-4 rounded-full shadow-md"
                          onClick={() => applyFlatDiscount(discountAmount2)}
                        >
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
          {order && selectedTable != null && (
            <PaymentModal tableNo={selectedTable} order={order} />
          )}

          {/* Locked overlay */}
          {order?.isLocked && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/50 text-white p-4">
              <div className="text-5xl">🔒</div>
              <div className="mt-2 text-lg font-bold text-center">
                Order locked: edits disabled
              </div>
              <div className="mt-1 text-sm opacity-90 text-center">
                Only managers can unlock this order
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
