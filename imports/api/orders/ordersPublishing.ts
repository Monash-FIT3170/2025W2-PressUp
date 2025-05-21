import { Meteor } from "meteor/meteor";
import { OrdersCollection } from "./OrdersCollection";

Meteor.publish("orders", function () {
  return OrdersCollection.find();
});
