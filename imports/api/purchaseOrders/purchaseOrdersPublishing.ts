import { Meteor } from "meteor/meteor";
import { PurchaseOrdersCollection } from "./PurchaseOrdersCollection";
import { requireLoginPublish } from "../accounts/wrappers";

Meteor.publish(
  "purchaseOrders",
  requireLoginPublish(function () {
    return PurchaseOrdersCollection.find();
  }),
);
