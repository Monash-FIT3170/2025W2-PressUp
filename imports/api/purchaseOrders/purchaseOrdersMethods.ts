import { Meteor } from "meteor/meteor";
import {
  PurchaseOrder,
  PurchaseOrdersCollection,
} from "./PurchaseOrdersCollection";

Meteor.methods({
  async "purchaseOrders.insert"(order: Omit<PurchaseOrder, "date">) {
    await PurchaseOrdersCollection.insertAsync({ ...order, date: new Date() });
  },
});
