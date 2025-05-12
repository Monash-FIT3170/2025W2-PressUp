import { Meteor } from "meteor/meteor";
import { StockItemsCollection } from "./StockItemsCollection";

Meteor.publish("stockItems", function () {
  return StockItemsCollection.find();
});
