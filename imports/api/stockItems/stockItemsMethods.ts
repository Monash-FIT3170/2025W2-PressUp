import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { StockItemsCollection } from "..";
import { requireLoginMethod } from "../accounts/wrappers";

Meteor.methods({
  "stockItems.insert": requireLoginMethod(async function (item: { name: string; quantity: number; location: string; supplier: string }) {
    check(item.name, String);
    check(item.quantity, Number);
    check(item.location, String);

    return await StockItemsCollection.insertAsync(item);
  }),

  "stockItems.update": requireLoginMethod(async function (itemId: string, updates: { name: string; quantity: number; location: string; supplier: string }) {
    check(itemId, String);
    check(updates.name, String);
    check(updates.quantity, Number);
    check(updates.location, String);

    return await StockItemsCollection.updateAsync(
      { _id: itemId },
      { $set: updates }
    );
  }),

  "stockItems.remove": requireLoginMethod(async function (itemId: string) {
    check(itemId, String);
    return await StockItemsCollection.removeAsync(itemId);
  })
});
