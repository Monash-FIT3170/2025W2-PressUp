import { Meteor } from "meteor/meteor";
import { StockItemsCollection } from "..";
import { requireLoginPublish } from "../accounts/wrappers";

Meteor.publish(
  "stockItems.all",
  requireLoginPublish(function () {
    return StockItemsCollection.find();
  }),
);
