import React from "react";
import { Meteor } from "meteor/meteor";
import { useTracker, useSubscribe } from 'meteor/react-meteor-data';
import { MenuItemsCollection } from "/imports/api/menuItems/MenuItemsCollection";
import { TransactionsCollection } from "/imports/api/transactions/TransactionsCollection";

export const ReceiptPage = () => {
  const isLoadingTransactions = useSubscribe("transactions");
  const transaction = useTracker(() => {
    const allTransactions = TransactionsCollection.find().fetch();
    return allTransactions[Math.floor(Math.random() * allTransactions.length)];
  }, []);

  if (isLoadingTransactions() || !transaction) {
    return (
      <div className="p-4 text-center text-gray-500 animate-pulse">
        Loading transaction...
      </div>
    );
  }

  const order = transaction.order;
  console.log(order);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-auto">
        <div className="max-w-md mx-auto border border-gray-300 p-6 rounded-lg shadow-md bg-white">

          {/* Display cafe and receipt details */}
          <h2 className="text-center text-xl font-bold mb-4">Cafe</h2>
          <p className="mb-2">Order #: {order.orderNo}</p>
          <p className="mb-2">Date: {new Date(transaction.paidAt).toLocaleString()}</p>

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
            <span>Subtotal:</span>
            <span>${order.totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>-${transaction.discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>${(order.totalPrice-transaction.discount).toFixed(2)}</span>
          </div>
          <p className="text-center mt-4 text-sm text-gray-600">
            Thank you for your order!
          </p>
        </div>
      </div>
    </div>
  );
};
