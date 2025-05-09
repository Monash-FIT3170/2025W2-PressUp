import { Meteor } from "meteor/meteor";
import { StockItemsCollection } from "./StockItemsCollection";

Meteor.publish("stock_items", function () {
  return StockItemsCollection.find();
});
