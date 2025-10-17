import React from "react";
import { useTracker, useSubscribe } from "meteor/react-meteor-data";
import { MenuItemsCollection } from "/imports/api/menuItems/MenuItemsCollection";
import { useNavigate, useLocation } from "react-router";
import {
  OrdersCollection,
  OrderType,
} from "/imports/api/orders/OrdersCollection";
import { Loading } from "../../components/Loading";


export const ReceiptPage = () => {
  const navigate = useNavigate();
  useSubscribe("menuItems");
  useSubscribe("orders");

  // passing split bill through navigation as it is not stored in the database
  const location = useLocation();
  const splits = location.state?.splits as string[] | undefined;

  // Get orderId from sessionStorage
  const orderId = sessionStorage.getItem("activeOrderId");

  // Find lowest unpaid dine-in order
  const lowestDineInOrderId = useTracker(() => {
    const orders = OrdersCollection.find(
      { orderType: OrderType.DineIn, paid: false },
      { sort: { orderNo: 1 } },
    ).fetch();
    return orders.length > 0 ? orders[0]._id : null;
  }, []);

  const handleGoBack = () => {
    if (lowestDineInOrderId) {
      sessionStorage.setItem("activeOrderId", lowestDineInOrderId);
    } else {
      sessionStorage.removeItem("activeOrderId");
    }
    navigate("/pos/orders");
  };

  // Retrieve order by _id
  const order = useTracker(() => {
    if (!orderId) return null;
    return OrdersCollection.findOne(orderId) ?? null;
  }, [orderId]);

  if (!order) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center h-full">
        <p className="text-gray-500">
          <Loading />
        </p>
      </div>
    );
  }

  // for split bill calculations
  const total = order.totalPrice;

  // split bill calculations
  const numericSplits = splits?.map((s) => parseFloat(s) || 0) ?? [];
  const sumOfSplits = numericSplits.reduce((a, b) => a + b, 0);
  const remaining = total - sumOfSplits;
  const displaySplits = numericSplits.length > 0 ? [...numericSplits] : [];
  if (remaining > 0) {
    displaySplits.push(remaining);
  }

  // Build default selections from canonical
  const getDefaultBaseKeys = (baseDefs?: Array<{key:string; default:boolean; removable?:boolean}>) =>
    (baseDefs ?? [])
      .filter(b => (b.removable === false ? true : !!b.default))
      .map(b => b.key);

  const getDefaultSelections = (optionGroups?: Array<{
    id: string;
    type: "single"|"multiple";
    required?: boolean;
    options: Array<{key:string;label:string;default?:boolean}>;
  }>) => {
    const out: Record<string, string[]> = {};
    for (const g of optionGroups ?? []) {
      const defaults = g.options.filter(o => o.default).map(o => o.key);
      if (g.type === "single") {
        if (defaults.length > 0) out[g.id] = [defaults[0]];
        else if (g.required && g.options[0]) out[g.id] = [g.options[0].key];
        else out[g.id] = [];
      } else {
        out[g.id] = defaults;
      }
    }
    return out;
  };

  const sameArray = (a: string[] = [], b: string[] = []) => {
    if (a.length !== b.length) return false;
    const sa = [...a].sort().join("|");
    const sb = [...b].sort().join("|");
    return sa === sb;
  };

  return (
    <div className="flex flex-1 flex-col">
      <button
        onClick={handleGoBack}
        className="inline-flex items-center space-x-2 p-2 rounded-md hover:bg-gray-300 transition-colors w-auto self-start"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <span>Back</span>
      </button>
      <div className="flex-1 overflow-auto">
        <div className="max-w-md mx-auto border border-gray-300 p-6 rounded-lg shadow-md bg-white">
          {/* Display cafe and receipt details */}
          <h2 className="text-center text-xl font-bold mb-4">Cafe</h2>
          <div className="flex justify-between mb-2">
            <p>Order No: {order.orderNo}</p>
            <p>
              {order.orderType == OrderType.DineIn
                ? order.tableNo == null
                  ? "Dine-In"
                  : `Table No: ${order.tableNo}`
                : "Takeaway"}
            </p>
          </div>
          <p className="mb-2">Date: {new Date().toLocaleString()}</p>

          {/* Horizontal divider */}
          <hr className="my-2" />

          {/* Three separate columns for Item, Quantity and Price */}
          <div className="grid grid-cols-3 mb-2">
            <span>Item</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Price</span>
          </div>

          {/* Display quantities */}
          {order.menuItems.map((menuItem, index) => {
            // grab canonical menu item to know defaults
            const canonical = useTracker(() => {
              if (!menuItem?.menuItemId) return null;
              return MenuItemsCollection.findOne(menuItem.menuItemId as any) ?? null;
            }, [menuItem?.menuItemId]);

            // compute diffs (brief)
            let customNotes: string[] = [];
            if (canonical) {
              const baseDefs = canonical.baseIngredients ?? [];
              const defaultBaseKeys = getDefaultBaseKeys(baseDefs);
              const chosenBase = new Set(
                (menuItem.baseIncludedKeys && menuItem.baseIncludedKeys.length > 0)
                  ? menuItem.baseIncludedKeys
                  : defaultBaseKeys,
              );

              // base adds/removals (skip non-removable; those are always on)
              for (const b of baseDefs) {
                if (b.removable === false) continue;
                const wasDefault = !!b.default;
                const isOn = chosenBase.has(b.key);
                if (wasDefault && !isOn) customNotes.push(`No ${b.label}`);
                if (!wasDefault && isOn) customNotes.push(`Add ${b.label}`);
              }

              // option changes
              const optionGroups = canonical.optionGroups ?? [];
              const defaultSelections = getDefaultSelections(optionGroups);
              const savedSelections = menuItem.optionSelections ?? {};

              for (const g of optionGroups) {
                // if this group is tied to a base key and base is OFF, skip
                const baseKey = g.id.split("-")[0];
                const baseExists = baseDefs.some((b: { key: string }) => b.key === baseKey);
                if (baseExists && !chosenBase.has(baseKey)) continue;

                const saved = Array.isArray(savedSelections[g.id])
                  ? savedSelections[g.id]
                  : [];

                const def = defaultSelections[g.id] ?? [];

                if (!sameArray(saved, def)) {
                  // build human readable labels for saved
                  const savedLabels = g.options
                    .filter((o: { key: string; label: string }) => saved.includes(o.key))
                    .map((o: { key: string; label: string }) => o.label);

                  if (g.type === "single") {
                    // e.g. "Milk type: Oat milk"
                    const label = savedLabels[0] ?? "(none)";
                    customNotes.push(`${g.label}: ${label}`);
                  } else if (savedLabels.length > 0) {
                    // e.g. "Extras: Caramel, Whip"
                    customNotes.push(`${g.label}: ${savedLabels.join(", ")}`);
                  }
                }
              }
            }

            return (
              <div key={index} className="mb-1">
                {/* main line */}
                <div className="grid grid-cols-3">
                  <span>{menuItem.name}</span>
                  <span className="text-right">{menuItem.quantity}</span>
                  <span className="text-right">
                    ${(menuItem.quantity * menuItem.price).toFixed(2)}
                  </span>
                </div>

                {/* brief customization line (only when needed) */}
                {customNotes.length > 0 && (
                  <div className="col-span-3 text-xs text-gray-500 mt-0.5">
                    {customNotes.join(" · ")}
                  </div>
                )}
              </div>
            );
          })}


          {/* Horizontal divider */}
          <hr className="my-2" />
          {order.originalPrice && order.totalPrice < order.originalPrice && (
            <div>
              <div className="flex justify-between">
                <span>Subotal:</span>
                <span>${order.originalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>
                  -${(order.originalPrice - order.totalPrice).toFixed(2)}
                </span>
              </div>
            </div>
          )}
          {displaySplits.length > 0 && (
            <>
              <div className="mb-2">
                <span>Splitting Bill ({displaySplits.length} Divisions)</span>
                <div>
                  {displaySplits.map((amount, index) => (
                    <div key={index} className="flex justify-between py-0.5">
                      <span>Split {index + 1} -</span>
                      <span>${amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <hr className="my-2" />
            </>
          )}
          <div className="flex justify-between">
            <span>Total:</span>
            <span>${order.totalPrice.toFixed(2)}</span>
          </div>
          <p className="text-center mt-4 text-sm text-gray-600">
            Thank you for your order!
          </p>
        </div>
      </div>
    </div>
  );
};
