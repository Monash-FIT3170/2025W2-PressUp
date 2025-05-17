import { Meteor } from "meteor/meteor";
import { PurchaseOrdersCollection } from "./PurchaseOrdersCollection";

Meteor.publish("purchaseOrders", function () {
  return PurchaseOrdersCollection.find();
});
