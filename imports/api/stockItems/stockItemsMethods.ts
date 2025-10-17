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
import { insertStockItem } from "./helpers";

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
    updatedLineItems[lineItemIndex] = {
      ...currentLineItem,
      ...(updates.quantity !== undefined && { quantity: updates.quantity }),
      ...(updates.location !== undefined && { location: updates.location }),
      ...(updates.expiry !== undefined && { expiry: updates.expiry }),
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

    return await StockItemsCollection.updateAsync(
      { name: oldName },
      { $set: { name: newName } },
      { multi: true },
    );
  }),

  "stockItems.updateStockItem": requireLoginMethod(async function (
    stockItemId: IdType,
    updates: UpdateStockItemInput,
  ) {
    check(stockItemId, String);

    if (updates.name !== undefined) {
      check(updates.name, String);
    }

    const updateObj: any = {};
    if (updates.name !== undefined) {
      updateObj.name = updates.name;
    }
    if (updates.supplier !== undefined) {
      updateObj.supplier = updates.supplier;
    }

    return await StockItemsCollection.updateAsync(stockItemId, {
      $set: updateObj,
    });
  }),

  "stockItems.removeFromSupplier": requireLoginMethod(async function (
    stockItemId: IdType,
  ) {
    check(stockItemId, String);
    return await StockItemsCollection.updateAsync(stockItemId, {
      $set: { supplier: null },
    });
  }),
});
