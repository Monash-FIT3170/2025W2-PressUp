import { Meteor } from "meteor/meteor";
import { OrdersCollection } from "./OrdersCollection";
import { Mongo } from "meteor/mongo";
import { requireLoginMethod } from "../accounts/wrappers";

Meteor.methods({
  "orders.updateOrder": requireLoginMethod(async function (orderId: Mongo.ObjectID, update: Partial<any>) {
    if (!orderId || !update) throw new Meteor.Error("invalid-arguments", "Order ID and update are required");
    await OrdersCollection.updateAsync(orderId, { $set: update });
  }),

  "orders.addOrder": requireLoginMethod(async function (order: any) {
    if (!order) throw new Meteor.Error("invalid-arguments", "Order data is required");
    return await OrdersCollection.insertAsync(order);
  }),
});
