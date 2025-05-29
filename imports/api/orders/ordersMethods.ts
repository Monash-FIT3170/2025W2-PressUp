import { Meteor } from "meteor/meteor";
import { OrdersCollection } from "./OrdersCollection";
import { Mongo } from "meteor/mongo";

Meteor.methods({
  async "orders.updateOrder"(orderId: Mongo.ObjectID, update: Partial<any>) {
    if (!orderId || !update) throw new Meteor.Error("invalid-arguments", "Order ID and update are required");
    await OrdersCollection.updateAsync(orderId, { $set: update });
  },
  async "orders.addOrder"(order: any) {
    if (!order) throw new Meteor.Error("invalid-arguments", "Order data is required");
    return OrdersCollection.insertAsync(order);
  },
});
