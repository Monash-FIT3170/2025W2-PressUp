import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { StockItemsCollection } from "..";
import { Mongo } from "meteor/mongo";

Meteor.methods({
  "stockItems.insert"(item: { name: string; quantity: number; location: string; supplier: Mongo.ObjectID }) {
    check(item.name, String);
    check(item.quantity, Number);
    check(item.location, String);

    return StockItemsCollection.insertAsync(item);
  },

  "stockItems.update"(itemId: string, updates: { name: string; quantity: number; location: string; supplier: Mongo.ObjectID }) {
    check(itemId, String);
    check(updates.name, String);
    check(updates.quantity, Number);
    check(updates.location, String);

    return StockItemsCollection.updateAsync(
      { _id: itemId },
      { $set: updates }
    );
  },
});
