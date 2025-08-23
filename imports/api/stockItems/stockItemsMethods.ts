import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { StockItem, StockItemsCollection } from "..";
import { requireLoginMethod } from "../accounts/wrappers";
import { IdType, OmitDB } from "../database";

Meteor.methods({
  "stockItems.insert": requireLoginMethod(async function (
    item: OmitDB<StockItem>,
  ) {
    check(item.name, String);
    check(item.quantity, Number);
    check(item.location, String);

    return await StockItemsCollection.insertAsync(item);
  }),

  "stockItems.update": requireLoginMethod(async function (
    itemId: IdType,
    updates: OmitDB<StockItem>,
  ) {
    check(itemId, String);
    check(updates.name, String);
    check(updates.quantity, Number);
    check(updates.location, String);

    return await StockItemsCollection.updateAsync(itemId, { $set: updates });
  }),

  "stockItems.remove": requireLoginMethod(async function (itemId: IdType) {
    check(itemId, String);
    return await StockItemsCollection.removeAsync(itemId);
  }),
});
