import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { StockItemsCollection } from "..";
import { Mongo } from "meteor/mongo";

Meteor.methods({
  "stockItems.insert"(item: { name: string; quantity: number; location: string; supplier: Mongo.ObjectID }) {
    check(item.name, String);
    check(item.quantity, Number);
    check(item.location, String);

    return StockItemsCollection.insertAsync(item);
  },
});
