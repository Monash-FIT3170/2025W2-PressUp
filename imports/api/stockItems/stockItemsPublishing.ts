import { Meteor } from "meteor/meteor";
import { StockItemsCollection } from "..";

Meteor.publish("stockItems.all", function () {
  return StockItemsCollection.find();
});
