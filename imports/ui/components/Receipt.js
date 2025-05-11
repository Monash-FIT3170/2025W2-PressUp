import React from "react";
import { Meteor } from "meteor/meteor";
import { useTracker, useSubscribe } from 'meteor/react-meteor-data';
import { MenuItemsCollection } from "/imports/api/MenuItemsCollection";
import { TransactionsCollection } from "/imports/api/transaction";


export const Receipt = () => {

  const isLoadingPosItems = useSubscribe("transactions")
  const paymentItems = useTracker( () => TransactionsCollection.find().fetch());

  const order = {
    orderNumber: Math.floor(100000 + Math.random() * 900000).toString(), // Generate random order number
    date: new Date().toLocaleString(), // date of order is current date time
    menuItems: paymentItems
  };
  
  console.log(order.menuItems)

  // Calculate total cost
  const getTotal = (menuItems) => {
    return menuItems.reduce(
      (sum, menuItem) => sum + menuItem.quantity * menuItem.price,
      0
    );
  };

  return (
    <div className="max-w-md mx-auto border border-gray-300 p-6 rounded-lg shadow-md bg-white">

      {/* Display cafe and receipt details */}
      <h2 className="text-center text-xl font-bold mb-4">Cafe</h2>
      <p className="mb-2">Order #: {order.orderNumber}</p>
      <p className="mb-2">Date: {order.date}</p>
      
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
      <div className="flex justify-between text-lg">
        <span>Total:</span>
        <span>${getTotal(order.menuItems).toFixed(2)}</span>
      </div>
      <p className="text-center mt-4 text-sm text-gray-600">
        Thank you for your order!
      </p>
    </div>
  );
};

export default Receipt;