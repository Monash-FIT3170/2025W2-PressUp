import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { StockItemsCollection } from "..";
import { requireLoginMethod } from "../accounts/wrappers";
import { IdType } from "../database";
import {
  AddStockItemInput,
  UpdateLineItemInput,
  UpdateStockItemInput,
} from "./types";
import { insertStockItem, mergeDuplicates } from "./helpers";

Meteor.methods({
  "stockItems.insert": requireLoginMethod(async function (
    input: AddStockItemInput,
  ) {
    check(input.name, String);
    check(input.quantity, Number);
    check(input.location, String);
    if (input.expiry != null) {
      check(input.expiry, Date);
    }

    return await insertStockItem(input);
  }),

  "stockItems.updateLineItem": requireLoginMethod(async function (
    stockItemId: IdType,
    lineItemId: string,
    updates: UpdateLineItemInput,
  ) {
    check(stockItemId, String);
    check(lineItemId, String);

    if (updates.quantity !== undefined) {
      check(updates.quantity, Number);
    }
    if (updates.location !== undefined) {
      check(updates.location, String);
    }
    if (updates.expiry !== undefined && updates.expiry != null) {
      check(updates.expiry, Date);
    }

    const stockItem = await StockItemsCollection.findOneAsync(stockItemId);
    if (!stockItem) {
      throw new Meteor.Error("not-found", "Stock item not found");
    }

    const lineItemIndex = stockItem.lineItems.findIndex(
      (li) => li.id === lineItemId,
    );
    if (lineItemIndex === -1) {
      throw new Meteor.Error("not-found", "Line item not found");
    }

    const updatedLineItems = [...stockItem.lineItems];
    const currentLineItem = updatedLineItems[lineItemIndex];

    const update: Partial<
      Pick<typeof currentLineItem, "quantity" | "location" | "expiry">
    > = {};
    if (updates.quantity !== undefined) {
      update.quantity = updates.quantity;
    }
    if (updates.location !== undefined) {
      update.location = updates.location;
    }
    if (updates.expiry !== undefined) {
      update.expiry = updates.expiry;
    }

    updatedLineItems[lineItemIndex] = {
      ...currentLineItem,
      ...update,
    };

    return await StockItemsCollection.updateAsync(stockItemId, {
      $set: { lineItems: updatedLineItems },
    });
  }),

  "stockItems.rename": requireLoginMethod(async function (
    oldName: string,
    newName: string,
  ) {
    check(oldName, String);
    check(newName, String);

    const itemsToRename = await StockItemsCollection.find({
      name: oldName,
    }).fetchAsync();

    for (const item of itemsToRename) {
      await StockItemsCollection.updateAsync(item._id, {
        $set: { name: newName },
      });

      await mergeDuplicates(newName, item.supplier);
    }

    return itemsToRename.length;
  }),

  "stockItems.updateStockItem": requireLoginMethod(async function (
    stockItemId: IdType,
    updates: UpdateStockItemInput,
  ) {
    check(stockItemId, String);

    if (updates.name !== undefined) {
      check(updates.name, String);
    }

    const stockItem = await StockItemsCollection.findOneAsync(stockItemId);
    if (!stockItem) {
      throw new Meteor.Error("not-found", "Stock item not found");
    }

    const newName = updates.name !== undefined ? updates.name : stockItem.name;
    const newSupplier =
      updates.supplier !== undefined ? updates.supplier : stockItem.supplier;

    const update: Partial<Pick<typeof stockItem, "name" | "supplier">> = {};
    if (updates.name !== undefined) {
      update.name = updates.name;
    }
    if (updates.supplier !== undefined) {
      update.supplier = updates.supplier;
    }

    await StockItemsCollection.updateAsync(stockItemId, {
      $set: update,
    });

    const mergedItemId = await mergeDuplicates(newName, newSupplier);
    return mergedItemId || stockItemId;
  }),

  "stockItems.removeFromSupplier": requireLoginMethod(async function (
    stockItemId: IdType,
  ) {
    check(stockItemId, String);

    const stockItem = await StockItemsCollection.findOneAsync(stockItemId);
    if (!stockItem) {
      throw new Meteor.Error("not-found", "Stock item not found");
    }

    await StockItemsCollection.updateAsync(stockItemId, {
      $set: { supplier: null },
    });

    const mergedItemId = await mergeDuplicates(stockItem.name, null);
    return mergedItemId || stockItemId;
  }),

  "stockItems.toggleDisposeLineItem": requireLoginMethod(async function (
    stockItemId: IdType,
    lineItemId: string,
  ) {
    check(stockItemId, String);
    check(lineItemId, String);

    const stockItem = await StockItemsCollection.findOneAsync(stockItemId);
    if (!stockItem) {
      throw new Meteor.Error("not-found", "Stock item not found");
    }

    const lineItemIndex = stockItem.lineItems.findIndex(
      (li) => li.id === lineItemId,
    );
    if (lineItemIndex === -1) {
      throw new Meteor.Error("not-found", "Line item not found");
    }

    const currentLineItem = stockItem.lineItems[lineItemIndex];
    const updatedLineItems = [...stockItem.lineItems];

    updatedLineItems[lineItemIndex] = {
      ...currentLineItem,
      disposed: !currentLineItem.disposed,
    };

    return await StockItemsCollection.updateAsync(stockItemId, {
      $set: { lineItems: updatedLineItems },
    });
  }),
});
