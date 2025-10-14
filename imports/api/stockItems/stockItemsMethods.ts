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
    if (item.expiryDate !== undefined) {
      check(item.expiryDate, Date);
    }

    return await StockItemsCollection.insertAsync(item);
  }),

  "stockItems.remove": requireLoginMethod(async function (itemId: IdType) {
    check(itemId, String);
    return await StockItemsCollection.removeAsync(itemId);
  }),

  "stockItems.removeFromSupplier": requireLoginMethod(async function (
    itemId: IdType,
  ) {
    check(itemId, String);
    return await StockItemsCollection.updateAsync(itemId, {
      $set: { supplier: null },
    });
  }),

  "stockItems.rename": requireLoginMethod(async function (
    oldName: string,
    newName: string,
  ) {
    check(oldName, String);
    check(newName, String);

    return await StockItemsCollection.updateAsync(
      { name: oldName },
      { $set: { name: newName } },
      { multi: true },
    );
  }),

  "stockItems.update": requireLoginMethod(async function (
    itemId: IdType,
    updates: Partial<
      Pick<OmitDB<StockItem>, "quantity" | "location" | "expiryDate">
    >,
  ) {
    check(itemId, String);

    if (updates.quantity !== undefined) {
      check(updates.quantity, Number);
    }
    if (updates.location !== undefined) {
      check(updates.location, String);
    }
    if (updates.expiryDate !== undefined) {
      check(updates.expiryDate, Date);
    }

    return await StockItemsCollection.updateAsync(itemId, { $set: updates });
  }),
});
