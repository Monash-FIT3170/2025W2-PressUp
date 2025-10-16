import React from "react";
import { useTracker, useSubscribe } from "meteor/react-meteor-data";
import { useNavigate, useLocation } from "react-router";
import {
  OrdersCollection,
  OrderType,
} from "/imports/api/orders/OrdersCollection";

export const ReceiptPage = () => {
  const navigate = useNavigate();
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
        <p className="text-gray-500">Loading receipt...</p>
      </div>
    );
  }

  // for split bill calculations
  const total = order.totalPrice;

  // split bill calculations
  const numericSplits = splits?.map(s => parseFloat(s) || 0) ?? [];
  const sumOfSplits = numericSplits.reduce((a, b) => a + b, 0);
  const remaining = total - sumOfSplits;
  const displaySplits = numericSplits.length > 0 ? [...numericSplits] : [];
  if (remaining > 0) {
    displaySplits.push(remaining);
  }

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
          {order.menuItems.map((menuItem, index) => (
            <div key={index} className="grid grid-cols-3 mb-1">
              <span>{menuItem.name}</span>
              <span className="text-right">{menuItem.quantity}</span>
              <span className="text-right">
                ${(menuItem.quantity * menuItem.price).toFixed(2)}
              </span>
            </div>
          ))}

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
