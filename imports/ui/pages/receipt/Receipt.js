import React from "react";
import { useTracker, useSubscribe } from 'meteor/react-meteor-data';
import { TransactionsCollection } from "/imports/api/transactions/TransactionsCollection";

export const ReceiptPage = () => {

  const isLoadingPosItems = useSubscribe("transactions")

    // Get the latest transaction
  const transaction = useTracker(() =>
    TransactionsCollection.findOne({}, { sort: { createdAt: -1 } })
  );

  console.log("Transaction")
  console.log(transaction)

  // Get the latest order in that transaction
  const order = transaction ? transaction.orders[transaction.orders.length - 1]: null;
  
  console.log("Order")
  console.log(order)
  
  const menuItems = order ? order.menuItems : [];

  if (!order) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center h-full">
        <p className="text-gray-500">Loading receipt...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-auto">
        <div className="max-w-md mx-auto border border-gray-300 p-6 rounded-lg shadow-md bg-white">

          {/* Display cafe and receipt details */}
          <h2 className="text-center text-xl font-bold mb-4">Cafe</h2>
          <div className="flex justify-between mb-2">
            <p>Order #: {order.orderNo}</p>
            <p>Table #: {order.tableNo}</p>
          </div>
          <p className="mb-2">
            Date: {order.createdAt
              ? new Date(order.createdAt).toLocaleString()
              : new Date().toLocaleString()}
          </p>
            
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
          <div className="flex justify-between">
            <span>Total:</span>
            <span>${order.originalPrice.toFixed(2)}</span>
          </div>
          {(order.totalPrice < order.originalPrice) && (
            <div>
              <div className="flex justify-between">
                <span>Discounted Amount:</span>
                <span>
                  -${(order.originalPrice - order.totalPrice).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${(order.totalPrice).toFixed(2)}</span>
              </div>
            </div>
          )}
          <p className="text-center mt-4 text-sm text-gray-600">
            Thank you for your order!
          </p>
        </div>
      </div>
    </div>
  );
};
