import { Meteor } from "meteor/meteor";
import { OrdersCollection } from "./OrdersCollection";
import { requireLoginPublish } from "../accounts/wrappers";

Meteor.publish("orders", requireLoginPublish(function () {
  return OrdersCollection.find();
}));
