import React, { useState, useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { MenuItem } from "/imports/api";
import { OrderMenuItem, OrderType } from "/imports/api/orders/OrdersCollection";
import { PaymentModal } from "./PaymentModal";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { Order, OrdersCollection } from "/imports/api";
import { IdType } from "/imports/api/database";
import { Roles } from "meteor/alanning:roles";
import { RoleEnum } from "/imports/api/accounts/roles";
import { Hide } from "./display/Hide";
import { Button } from "./interaction/Button";
import { Mongo } from "meteor/mongo";

import MenuItemIngredientsDialog from "./MenuItemIngredientsDialog";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton as MuiIconButton } from "@mui/material";

interface PosSideMenuProps {
  tableNo: number | null;
  items: (MenuItem | OrderMenuItem)[];
  total: number;
  orderId?: string;
  onIncrease: (itemId: IdType) => void;
  onDecrease: (itemId: IdType) => void;
  onDelete: (itemId: IdType) => void;
  onUpdateOrder?: (fields: Partial<Order>) => void;
  onActiveOrderChange?: (orderId: string | null) => void;
}

export const PosSideMenu = ({
  items: _items,
  total,
  orderId,
  onUpdateOrder,
  onActiveOrderChange,
}: PosSideMenuProps) => {
  // Fetch the current order for this table
  useSubscribe("orders");
  useSubscribe("tables");
  const isMenuItemsLoading = useSubscribe("menuItems")(); // Immediately call to get boolean
  const [orderType, setOrderType] = useState<OrderType>(OrderType.DineIn);

  // Use sessionStorage for activeOrderId
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(() => {
    return sessionStorage.getItem("activeOrderId") || null;
  });

  // List active orders for each type
  const activeDineInOrders = useTracker(
    () =>
      OrdersCollection.find(
        { orderType: OrderType.DineIn, paid: false },
        { sort: { orderNo: 1 } },
      ).fetch(),
    [],
  );
  const activeTakeawayOrders = useTracker(
    () =>
      OrdersCollection.find(
        { orderType: OrderType.Takeaway, paid: false },
        { sort: { createdAt: -1 } },
      ).fetch(),
    [],
  );

  // Clear invalid selectedOrderId if it doesn't exist in the current active list
  useEffect(() => {
    if (!selectedOrderId) return;
    const list =
      orderType === OrderType.DineIn
        ? activeDineInOrders
        : activeTakeawayOrders;
    const stillExists = list.some((o) => o._id === selectedOrderId);
    if (!stillExists) {
      setSelectedOrderId(null);
      sessionStorage.removeItem("activeOrderId");
      onActiveOrderChange?.(null);
    }
  }, [
    orderType,
    selectedOrderId,
    activeDineInOrders.length,
    activeTakeawayOrders.length,
  ]);

  // Clear selectedOrderId if the order type changes and the selected order is invalid
  useEffect(() => {
    if (!selectedOrderId) return;
    const cur = OrdersCollection.findOne(selectedOrderId);
    if (!cur || cur.orderType !== orderType || cur.paid) {
      setSelectedOrderId(null);
      sessionStorage.removeItem("activeOrderId");
      onActiveOrderChange?.(null);
    }
  }, [orderType]);

  // Select order by id
  const order = useTracker(() => {
    if (selectedOrderId) {
      return OrdersCollection.findOne(selectedOrderId as string) ?? null;
    }
    return null;
  }, [selectedOrderId]);

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
    if (order?._id) {
      sessionStorage.setItem("activeOrderId", order._id);
    } else {
      sessionStorage.removeItem("activeOrderId");
    }
    onActiveOrderChange?.(order?._id ?? null);
  }, [order?._id, onActiveOrderChange]);

  // Set active order
  const setActiveOrder = (orderId: string | null) => {
    setSelectedOrderId(orderId);
    if (orderId) {
      sessionStorage.setItem("activeOrderId", orderId);
    } else {
      sessionStorage.removeItem("activeOrderId");
    }
    onActiveOrderChange?.(orderId);
  };

  // Function to get lowest unpaid order depending on the order type
  const getLowestOrderId = (type: OrderType) => {
    const selector =
      type === OrderType.DineIn
        ? { orderType: OrderType.DineIn, paid: false }
        : { orderType: OrderType.Takeaway, paid: false };

    // Meteor 타입 사용
    const sort: Mongo.SortSpecifier =
      type === OrderType.DineIn ? { orderNo: 1 } : { createdAt: -1 };

    const orders = OrdersCollection.find(selector, { sort }).fetch();
    return orders[0]?._id ?? null;
  };

  // Split Bill state
  const [splits, setSplits] = useState<string[]>([]);
  const [remaining, setRemaining] = useState<number>(0);

  // Recalculate remaining when total changes
  useEffect(() => {
    if (baseTotal) setRemaining(baseTotal);
  }, [baseTotal]);

  const handleAddSplit = () => {
    if (remaining <= 0) return;
    setSplits((prev) => [...prev, ""]);
  };



  const handleSplitChange = (index: number, value: string) => {
    const decimalRegex = /^\d*\.?\d{0,2}$/;

    if (value === "" || decimalRegex.test(value)) {
      const newSplits = [...splits];
      newSplits[index] = value;
      setSplits(newSplits);

      // Calculate remaining
      const sum = newSplits.reduce((a, b) => a + (parseFloat(b) || 0), 0);

      setRemaining(parseFloat((baseTotal - sum).toFixed(2)));
    }
  };


  const handleResetSplits = () => {
    setSplits([]);
    setRemaining(baseTotal);
  };



  const keyForQty = (it: any): string | null =>
    (it?.lineId as string) ??
    (it?.menuItemId as string) ??
    (it?._id as string) ??
    null;

  const canDeleteByLineId = (it: any): it is { lineId: string } =>
    typeof it?.lineId === "string" && it.lineId.length > 0;

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

  const rolesLoaded = useSubscribe("users.roles")();
  const rolesGraphLoaded = useSubscribe("users.rolesGraph")();
  const canLockOrder = useTracker(
    () => Roles.userIsInRole(Meteor.userId(), [RoleEnum.MANAGER]),
    [rolesLoaded, rolesGraphLoaded],
  );

  // Ingredient dialog state
  const [ingredientDialog, setIngredientDialog] = useState<{
    open: boolean;
    item: (MenuItem | OrderMenuItem) | null;
    index: number | null;
  }>({ open: false, item: null, index: null });

  const openIngredientDialog = (
    item: MenuItem | OrderMenuItem,
    index: number,
  ) => {
    setIngredientDialog({ open: true, item, index });
  };

  // const closeIngredientDialog = () => {
  //   setIngredientDialog({ open: false, item: null, idx: null, orderId: null, locked: false });
  // };

  return (
    <div className="w-[20vw] h-[75vh] flex flex-col">
      {/* Header */}
      <div className="flex flex-col bg-press-up-purple text-white px-4 py-2 rounded-t-md">
        {/* Toggle buttons */}
        <div className="flex justify-center gap-2 mb-2 relative">
          <button
            onClick={() => {
              setOrderType(OrderType.DineIn);
              setActiveOrder(getLowestOrderId(OrderType.DineIn));
            }}
            className={`px-3 py-1 rounded-full font-semibold ${orderType === OrderType.DineIn
              ? "bg-white text-press-up-purple"
              : "bg-press-up-purple border border-white"
              }`}
          >
            Dine In
          </button>

          <button
            onClick={() => {
              setOrderType(OrderType.Takeaway);
              setActiveOrder(getLowestOrderId(OrderType.Takeaway));
            }}
            className={`px-3 py-1 rounded-full font-semibold ${orderType === OrderType.Takeaway
              ? "bg-white text-press-up-purple"
              : "bg-press-up-purple border border-white"
              }`}
          >
            Takeaway
          </button>
        </div>

        {/* Order Dropdown for Dine-in and Takeaway */}
        <div className="flex justify-center items-center relative">
          <div className="absolute left-0">
            <button
              className="px-3 rounded-full font-semibold text-m transition-colors duration-200 bg-white text-press-up-purple hover:bg-gray-300"
              onClick={async () => {
                try {
                  // create a fresh order for current type
                  const newId = await Meteor.callAsync("orders.addOrder", {
                    orderType,
                    tableNo: null,
                    menuItems: [],
                    totalPrice: 0,
                    createdAt: new Date(),
                    orderStatus: "pending",
                    paid: false,
                  });
                  setSelectedOrderId(String(newId));
                  onActiveOrderChange?.(String(newId));
                } catch (e) {
                  console.error(e);
                  alert("Failed to create order.");
                }
              }}
            >
              +
            </button>
          </div>
          <select
            className="text-lg font-semibold bg-press-up-purple text-white border-none outline-none"
            value={selectedOrderId ?? ""}
            onChange={(e) => {
              const v = e.target.value || null;
              setSelectedOrderId(v);
              if (v) {
                sessionStorage.setItem("activeOrderId", v);
              } else {
                sessionStorage.removeItem("activeOrderId");
              }
              onActiveOrderChange?.(v);
            }}
          >
            <option value="">Select Order</option>
            {(orderType === OrderType.DineIn
              ? activeDineInOrders
              : activeTakeawayOrders
            ).map((o) => (
              <option key={o._id} value={o._id}>
                Order #{o.orderNo}
              </option>
            ))}
          </select>
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
              const rowKey = (item as any)?.lineId
                ? (item as any).lineId
                : (item as any)?._id
                  ? `${(item as any)._id}:${idx}`
                  : `${order?._id ?? "order"}:${idx}`;
              return (
                <div
                  key={rowKey}
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
                      onClick={() => {
                        if (order?.isLocked) return;
                        const key = keyForQty(item);
                        if (!key || !order?._id) return;
                        Meteor.call(
                          "orders.decQtyByKey",
                          order._id,
                          String(key),
                          (err: any) => {
                            if (err) {
                              console.error(err);
                              alert("Failed to decrease quantity.");
                            }
                          },
                        );
                      }}
                      className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-lg font-bold"
                      disabled={Boolean(order?.isLocked)}
                    >
                      –
                    </button>
                    <span>{qty}</span>
                    <button
                      onClick={() => {
                        if (order?.isLocked) return;
                        const key = keyForQty(item);
                        if (!key || !order?._id) return;
                        Meteor.call(
                          "orders.incQtyByKey",
                          order._id,
                          String(key),
                          (err: any) => {
                            if (err) {
                              console.error(err);
                              alert("Failed to increase quantity.");
                            }
                          },
                        );
                      }}
                      className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-lg font-bold"
                      disabled={Boolean(order?.isLocked)}
                    >
                      ＋
                    </button>
                    <button
                      onClick={() => {
                        if (order?.isLocked) return;
                        if (!order?._id) return;

                        if (canDeleteByLineId(item)) {
                          Meteor.call(
                            "orders.removeMenuItemByLineId",
                            order._id,
                            item.lineId,
                            (err: any) => {
                              if (err) {
                                console.error(err);
                                alert("Failed to remove item.");
                              }
                            },
                          );
                        } else {
                          Meteor.call(
                            "orders.removeMenuItemAt",
                            order._id,
                            idx,
                            (err: any) => {
                              if (err) {
                                console.error(err);
                                alert("Failed to remove item.");
                              }
                            },
                          );
                        }
                      }}
                      className="text-red-500 hover:text-red-700 text-lg font-bold"
                      disabled={Boolean(order?.isLocked)}
                    >
                      🗑
                    </button>

                    {/* New: View ingredients button */}
                    <MuiIconButton
                      size="small"
                      onClick={() => openIngredientDialog(item, idx)}
                      disabled={isMenuItemsLoading || Boolean(order?.isLocked)} // Updated condition
                      aria-label="View ingredients"
                    >
                      <MoreVertIcon fontSize="small" />
                    </MuiIconButton>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-gray-500">
              {/* Empty state for no order selected */}
              {!selectedOrderId && (
                <div className="bg-yellow-100 p-4 rounded-md space-y-2">
                  <p className="font-bold text-gray-800 mb-2">
                    No active {orderType} order.
                  </p>
                  <p className="text-sm text-gray-700">
                    Use the + button above to create a new order.
                  </p>
                </div>
              )}
              {/* If order selected but no items, show nothing (allow adding from menu) */}
              {selectedOrderId && <span className="sr-only" />}
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
          {/* --- Split Bill Section --- */}
          {order && (
            <div className="mt-4 mb-4 border-t border-white/30 pt-3">
              {/* Header Row: Split + Reset buttons */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex gap-2 w-full justify-end">
                  <Button
                    variant="negative"
                    onClick={handleAddSplit}
                    className="text-sm py-2 px-4 w-full font-semibold"
                  >
                    Split Bill
                  </Button>

                  {splits.length > 0 && (
                    <button
                      onClick={handleResetSplits}
                      className="text-sm py-2 px-4 rounded-md bg-gray-300 text-black font-semibold hover:bg-gray-200 transition shadow-sm"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Show payment fields only after Split is clicked */}
              {splits.length > 0 && (
                <>
                  {splits.map((val, i) => (
                    <div
                      key={i}
                      className="flex flex-col mb-2 bg-white/10 rounded-md px-2 py-1"
                    >
                      <label className="text-xs font-medium text-white mb-1">
                        Payment {i + 1}
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={val}
                        onChange={(e) => handleSplitChange(i, e.target.value)}
                        placeholder="Enter amount e.g. 10.50"
                        className={`w-full bg-white rounded px-3 py-1.5 text-xs text-black placeholder-gray-400 focus:outline-none focus:ring-2 ${parseFloat(val) < 0 || isNaN(parseFloat(val))
                          ? "ring-red-400"
                          : "focus:ring-pink-300"
                          } shadow-sm`}
                      />
                      {/* Validation text */}
                      {parseFloat(val) < 0 || isNaN(parseFloat(val)) ? (
                        <span className="text-red-400 text-[11px] mt-1">
                          Please enter a valid amount.
                        </span>
                      ) : remaining < 0 ? (
                        <span className="text-red-400 text-[11px] mt-1">
                          Total exceeds bill amount.
                        </span>
                      ) : null}
                    </div>
                  ))}

                  {/* Non-editable remaining payment */}
                  {remaining > 0 && (
                    <div className="flex flex-col mb-2 bg-white/10 rounded-md px-2 py-1">
                      <label className="text-xs font-medium text-white mb-1">
                        Payment {splits.length + 1}
                      </label>
                      <input
                        type="text"
                        value={`$${remaining.toFixed(2)}`}
                        readOnly
                        className="w-full bg-gray-50 rounded px-3 py-1.5 text-xs text-black shadow-sm cursor-not-allowed"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}


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
                  order.orderType === OrderType.DineIn
                    ? (order.tableNo ?? null)
                    : null
                }
                order={order}
                splits={splits}
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
      <MenuItemIngredientsDialog
        open={ingredientDialog.open}
        item={ingredientDialog.item}
        orderId={order?._id}
        itemIndex={ingredientDialog.index ?? undefined}
        locked={Boolean(order?.isLocked)}
        onClose={() =>
          setIngredientDialog({ open: false, item: null, index: null })
        }
      />
    </div>
  );
};
