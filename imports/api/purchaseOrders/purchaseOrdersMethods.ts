import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import {
  PurchaseOrdersCollection,
  StockItemLine,
} from "./PurchaseOrdersCollection";
import { requireLoginMethod } from "../accounts/wrappers";

Meteor.methods({
  "purchaseOrders.new": requireLoginMethod(async function ({ supplierId }: { supplierId: Mongo.ObjectID }) {
    const number = await PurchaseOrdersCollection.countDocuments();
    return await PurchaseOrdersCollection.insertAsync({
      supplier: supplierId,
      number,
      stockItems: [],
      date: new Date(),
    });
  }),

  "purchaseOrders.update": requireLoginMethod(async function ({
    id,
    stockItems,
  }: {
    id: Mongo.ObjectID;
    stockItems: StockItemLine[];
  }) {
    check(id, String);
    check(stockItems, Array);

    await PurchaseOrdersCollection.updateAsync(id, { $set: { stockItems } });
  }),
});
