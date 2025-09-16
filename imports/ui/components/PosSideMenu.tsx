import React, { useState, useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { MenuItem, Tables } from "/imports/api";
import { OrderMenuItem } from "/imports/api/orders/OrdersCollection";
import { PaymentModal } from "./PaymentModal";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { Order, OrdersCollection, TablesCollection } from "/imports/api";
import { IdType } from "/imports/api/database";
import { Roles } from "meteor/alanning:roles";
import { RoleEnum } from "/imports/api/accounts/roles";
import { Hide } from "./display/Hide";
import { useNavigate, useLocation } from "react-router";
import { Button } from "./interaction/Button";

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
  onActiveOrderChange?: (orderId: string | null) => void;
}

export const PosSideMenu = ({
  items: _items,
  total,
  orderId,
  onIncrease,
  onDecrease,
  onDelete,
  onUpdateOrder,
  selectedTable,
  setSelectedTable,
  onActiveOrderChange,
}: PosSideMenuProps) => {
  // Fetch the current order for this table
  useSubscribe("orders");
  useSubscribe("tables");
  const [orderType, setOrderType] = useState<"dine-in" | "takeaway">("dine-in");

  const [selectedTakeawayId, setSelectedTakeawayId] = useState<string | null>(
    null,
  );
  const activeTakeawayOrders = useTracker(
    () =>
      OrdersCollection.find(
        { orderType: "takeaway", paid: false },
        { sort: { createdAt: -1 } },
      ).fetch(),
    [],
  );

  const order = useTracker(() => {
    if (orderType === "dine-in" && selectedTable != null) {
      // Find the table and get its activeOrderID
      const table = TablesCollection.findOne({ tableNo: selectedTable });
      if (table?.activeOrderID) {
        return OrdersCollection.findOne(table.activeOrderID) ?? null;
      }
      return null;
    }
    if (orderType === "takeaway" && selectedTakeawayId) {
      return OrdersCollection.findOne(selectedTakeawayId as string) ?? null;
    }
    return null;
  }, [orderType, selectedTable, selectedTakeawayId]);

  const displayedItems = order?.menuItems ?? [];
  const baseTotal =
    order?.totalPrice ??
    displayedItems.reduce((s, i) => s + i.price * (i.quantity ?? 1), 0) ??
    total;

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
  const [finalTotal, setFinalTotal] = useState(baseTotal);

  // Store original price in state, and always use it for discount calculations
  const [originalPrice, setOriginalPrice] = useState(baseTotal);

  useEffect(() => {
    setDiscountPercent(order?.discountPercent || 0);
    setDiscountAmount(order?.discountAmount || 0);
  }, [order?._id, order?.discountPercent, order?.discountAmount]);

  useEffect(() => {
    if (
      (order?.discountPercent ?? 0) === 0 &&
      (order?.discountAmount ?? 0) === 0
    ) {
      setOriginalPrice(baseTotal); // use baseTotal, not props.total
    } else if (order?.originalPrice) {
      setOriginalPrice(order.originalPrice);
    }
  }, [
    baseTotal,
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

  useEffect(() => {
    onActiveOrderChange?.(order?._id ?? null);
  }, [order?._id, onActiveOrderChange]);

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

  const tables: Tables[] = useTracker(
    () => TablesCollection.find({}, { sort: { tableNo: 1 } }).fetch(),
    [],
  );

  const navigate = useNavigate();
  const location = useLocation();

  // Table change handler
  const handleTableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Number(e.target.value);
    setSelectedTable(selected);
    // Update the URL with the new tableNo as a query parameter
    const params = new URLSearchParams(location.search);
    params.set("tableNo", String(selected));
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const rolesLoaded = useSubscribe("users.roles")();
  const rolesGraphLoaded = useSubscribe("users.rolesGraph")();
  const canLockOrder = useTracker(
    () => Roles.userIsInRole(Meteor.userId(), [RoleEnum.MANAGER]),
    [rolesLoaded, rolesGraphLoaded],
  );

  return (
    <div className="w-[20vw] h-[75vh] flex flex-col">
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
              {tables.map((table) => (
                <option
                  key={table.tableNo}
                  value={table.tableNo}
                  disabled={!table.isOccupied}
                  className={table.isOccupied ? "bg-red-400" : "bg-green-400"}
                >
                  Table {table.tableNo}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-2">
              <div className="absolute left-0">
                <button
                  className="px-3 rounded-full font-semibold text-m transition-colors duration-200 bg-white text-press-up-purple hover:bg-gray-300"
                  onClick={async () => {
                    try {
                      // create a fresh takeaway order
                      const newId = await Meteor.callAsync("orders.addOrder", {
                        orderType: "takeaway",
                        tableNo: null,
                        menuItems: [],
                        totalPrice: 0,
                        createdAt: new Date(),
                        orderStatus: "pending",
                        paid: false,
                      });
                      setSelectedTakeawayId(String(newId)); // select the new order immediately
                      onActiveOrderChange?.(String(newId));
                    } catch (e) {
                      console.error(e);
                      alert("Failed to create takeaway order.");
                    }
                  }}
                >
                  +
                </button>
              </div>
              <select
                className="text-lg font-semibold bg-press-up-purple text-white border-none outline-none"
                value={selectedTakeawayId ?? ""}
                onChange={(e) => {
                  const v = e.target.value || null;
                  setSelectedTakeawayId(v);
                  onActiveOrderChange?.(v);
                }}
              >
                <option value="">Select Order</option>
                {activeTakeawayOrders.map((o) => (
                  <option key={o._id} value={o._id}>
                    Order #{o.orderNo}
                  </option>
                ))}
              </select>
            </div>
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
                    (err: unknown) =>
                      err ? reject(err as Error) : resolve(undefined),
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
      <div className="relative flex-1 flex flex-col overflow-y-auto ">
        <div className="flex-1 overflow-y-auto p-2 space-y-4 bg-gray-100 border-solid border-[#6f597b] border-4">
          {displayedItems.length > 0 ? (
            displayedItems.map((item, idx) => {
              const qty = item.quantity ?? 1;
              const price = item.price;
              return (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-md shadow-md space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">
                      {item.name}
                    </span>
                    <span className="font-semibold text-gray-800">
                      ${(price * qty).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => item._id && onDecrease(item._id)}
                      className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-lg font-bold"
                      disabled={Boolean(order?.isLocked)}
                    >
                      –
                    </button>
                    <span>{qty}</span>
                    <button
                      onClick={() => item._id && onIncrease(item._id)}
                      className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-lg font-bold"
                      disabled={Boolean(order?.isLocked)}
                    >
                      ＋
                    </button>
                    <button
                      onClick={() => item._id && onDelete(item._id)}
                      className="text-red-500 hover:text-red-700 text-lg font-bold"
                      disabled={Boolean(order?.isLocked)}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-gray-500">
              {selectedTable != null &&
              tables.find((t) => t.tableNo === selectedTable)?.isOccupied &&
              !tables.find((t) => t.tableNo === selectedTable)
                ?.activeOrderID ? (
                /* dine-in empty: show "start new order for table" card (keep as-is) */
                <div className="bg-yellow-100 p-4 rounded-md space-y-2">
                  <p className="font-bold text-gray-800 mb-2">
                    No active orders for this table.
                  </p>
                  <Button
                    variant="positive"
                    width="full"
                    onClick={async () => {
                      try {
                        console.log("Creating order for table:", selectedTable);
                        const dbTable = tables.find(
                          (t) => t.tableNo === selectedTable,
                        );
                        if (!dbTable || !dbTable._id) {
                          alert("Could not find table in database.");
                          return;
                        }

                        const orderId = await Meteor.callAsync(
                          "orders.addOrder",
                          {
                            tableNo: selectedTable,
                            menuItems: [],
                            totalPrice: 0,
                            createdAt: new Date(),
                            orderStatus: "pending",
                            paid: false,
                          },
                        );

                        await Meteor.callAsync(
                          "tables.addOrder",
                          dbTable._id,
                          orderId,
                        );

                        console.log("Order created:", orderId);
                      } catch (err) {
                        console.error("Error adding order:", err);
                        alert(
                          "Failed to add order. Check console for details.",
                        );
                      }
                    }}
                    disabled={
                      !!tables.find(
                        (t) => t.tableNo === selectedTable && t.activeOrderID, // <-- Only block if there's an active order
                      )
                    }
                  >
                    Start a new order?
                  </Button>
                </div>
              ) : orderType === "takeaway" && !selectedTakeawayId ? (
                /* takeaway empty + no selected order: show helper */
                <div className="bg-yellow-100 p-4 rounded-md space-y-2">
                  <p className="font-bold text-gray-800 mb-2">
                    No active takeaway order.
                  </p>
                  <p className="text-sm text-gray-700">
                    Use the button below to start.
                  </p>
                </div>
              ) : (
                /* takeaway with an order selected but no items: show nothing (so the user can add from menu) */
                <span className="sr-only">{/* keep area clean */}</span>
              )}
            </div>
          )}
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
            <div className="flex justify-between items-center mb-2 bg-press-up-positive-button rounded-lg p-1">
              <span className="text-sm font-bold">
                Percent Discount: {discountPercent}%
              </span>
            </div>
          )}
          {discountAmount !== 0 && (
            <div className="flex justify-between items-center mb-2 bg-press-up-positive-button rounded-lg p-1">
              <span className="text-sm font-bold">
                Flat Discount: ${discountAmount}
              </span>
            </div>
          )}
          {savedAmount !== 0 && (
            <div className="flex justify-between items-center mb-2 bg-press-up-positive-button rounded-lg p-1">
              <span className="text-sm font-bold">
                Cost Saved: - ${savedAmount.toFixed(2)}
              </span>
            </div>
          )}

          {/* Discount button */}
          <div className="mb-4">
            <Button
              variant="negative"
              width="full"
              onClick={() => {
                if (order?.isLocked) return;
                setOpenDiscountPopup(true);
                setDiscountPopupScreen("menu");
              }}
              disabled={Boolean(order?.isLocked)}
            >
              Discount
            </Button>
          </div>
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
                    className="bg-press-up-negative-button text-white text-nowrap shadow-lg/20 hover:shadow-md ease-in-out transition-all duration-300 rounded-xl cursor-pointer inline-flex py-2 px-4 grow-0 text-sm font-medium items-center justify-center "
                    onClick={() => {
                      setOpenDiscountPopup(false);
                      setDiscountPopupScreen("menu");
                    }}
                    disabled={Boolean(order?.isLocked)}
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
                          <div className="flex justify-between items-center mb-2 bg-press-up-positive-button text-black text-sm rounded-lg p-2 px-4">
                            <span className="text-sm font-bold">
                              Percentage Discount (%): {discountPercent}%
                            </span>
                          </div>
                        )}
                        {discountAmount !== 0 && (
                          <div className="flex justify-between items-center mb-2 bg-press-up-positive-button text-black text-sm rounded-lg p-2 px-4">
                            <span className="text-sm font-bold">
                              Flat Discount ($): ${discountAmount}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="items-center">
                        <div className="mb-8">
                          <div className="w-full my-4 flex justify-center">
                            <button
                              className="bg-press-up-positive-button text-white text-nowrap shadow-lg/20 hover:shadow-md ease-in-out transition-all duration-300 rounded-xl cursor-pointer inline-flex p-2 grow-0 text-xl font-medium items-center justify-center w-full"
                              onClick={() =>
                                setDiscountPopupScreen("percentage")
                              }
                            >
                              Percentage Discount (%)
                            </button>
                          </div>
                          <div className="w-full my-4 flex justify-center">
                            <button
                              className="bg-press-up-positive-button text-white text-nowrap shadow-lg/20 hover:shadow-md ease-in-out transition-all duration-300 rounded-xl cursor-pointer inline-flex p-2 grow-0 text-xl font-medium items-center justify-center w-full"
                              onClick={() => setDiscountPopupScreen("flat")}
                            >
                              Flat Discount ($)
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-row w-full justify-between">
                          <div className="mr-2">
                            <Button
                              variant="negative"
                              width="fit"
                              onClick={() => {
                                removePercentDiscount();
                              }}
                            >
                              Reset Percentage Discount (%)
                            </Button>
                          </div>
                          <div className="ml-2">
                            <Button
                              variant="negative"
                              width="fit"
                              onClick={() => {
                                removeFlatDiscount();
                              }}
                            >
                              Reset Flat Discount ($)
                            </Button>
                          </div>
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
                      <Button
                        variant="negative"
                        onClick={() => setDiscountPopupScreen("menu")}
                      >
                        ← Back
                      </Button>
                    </div>
                    <div className="mt-4">
                      <span className="font-bold text-xl text-gray-700">
                        Select Discount Percentage
                      </span>
                      <div className="grid grid-cols-4 gap-1 my-2">
                        {[5, 10, 25, 50].map((d) => (
                          <Button
                            key={d}
                            variant="positive"
                            width="full"
                            onClick={() => applyPercentDiscount(d)}
                          >
                            {d}%
                          </Button>
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
                        <div className="mt-2">
                          <Button
                            variant="negative"
                            onClick={() =>
                              applyPercentDiscount(discountPercent2)
                            }
                          >
                            Apply
                          </Button>
                        </div>
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
                      <Button
                        variant="negative"
                        onClick={() => setDiscountPopupScreen("menu")}
                      >
                        ← Back
                      </Button>
                    </div>
                    <div className="mt-4">
                      <span className="font-bold text-xl text-gray-700">
                        Select Discount Amount
                      </span>
                      <div className="grid grid-cols-4 gap-1 my-2">
                        {[5, 10, 15, 20].map((d) => (
                          <Button
                            key={d}
                            variant="positive"
                            width="full"
                            onClick={() => applyFlatDiscount(d)}
                          >
                            ${d}
                          </Button>
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
                        <div className="mt-2">
                          <Button
                            variant="positive"
                            onClick={() => applyFlatDiscount(discountAmount2)}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pay button */}
          {order && (
            <div className="my-4">
              <PaymentModal
                tableNo={
                  order.orderType === "dine-in" ? (order.tableNo ?? null) : null
                }
                order={order}
              />
            </div>
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
