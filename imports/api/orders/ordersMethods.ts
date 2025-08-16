import { Meteor } from "meteor/meteor";
import { OrdersCollection } from "./OrdersCollection";
import { check } from "meteor/check"; 
import { requireLoginMethod } from "../accounts/wrappers";

Meteor.methods({
  "orders.updateOrder": requireLoginMethod(async function (orderId: string, update: Partial<any>) {
    if (!orderId || !update) throw new Meteor.Error("invalid-arguments", "Order ID and update are required");
    await OrdersCollection.updateAsync(orderId, { $set: update });
  }),

  "orders.addOrder": requireLoginMethod(async function (order: any) {
    if (!order) throw new Meteor.Error("invalid-arguments", "Order data is required");
    return await OrdersCollection.insertAsync(order);
  }),

  'orders.getAll': requireLoginMethod(async function () {
    return OrdersCollection.find().fetch();
  }),

  "orders.setMenuItemServed": requireLoginMethod(function (orderId: string, index: number, served: boolean) {
    check(orderId, String);
    check(index, Number);
    check(served, Boolean);
    return OrdersCollection.update(orderId, {
      $set: { [`menuItems.${index}.served`]: served },
    });
  }),

  "orders.setAllMenuItemsServed": requireLoginMethod(function (orderId: string, served: boolean) {
    check(orderId, String);
    check(served, Boolean);
    return OrdersCollection.update(orderId, {
      $set: { "menuItems.$[].served": served },
    });
  }),

});
