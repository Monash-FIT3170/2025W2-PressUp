import { Meteor } from "meteor/meteor";
import { StockItemsCollection } from "/imports/api/stock_item";

Meteor.startup(async () => {
  Meteor.publish("stock_items", function () {
    return StockItemsCollection.find();
  });
});
