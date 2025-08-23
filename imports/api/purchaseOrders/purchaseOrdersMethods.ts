import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import {
  PurchaseOrdersCollection,
  StockItemLine,
} from "./PurchaseOrdersCollection";
import { requireLoginMethod } from "../accounts/wrappers";
import { IdType } from "../database";

Meteor.methods({
  "purchaseOrders.new": requireLoginMethod(async function ({ supplierId }: { supplierId: IdType }) {
    const number = await PurchaseOrdersCollection.countDocuments();
    return await PurchaseOrdersCollection.insertAsync({
      supplier: supplierId,
      number,
      stockItems: [],
      totalCost: number,
      date: new Date(),
    });
  }),

  "purchaseOrders.update": requireLoginMethod(async function ({
    id,
    stockItems,
  }: {
    id: IdType;
    stockItems: StockItemLine[];
  }) {
    check(id, String);
    check(stockItems, Array);

    const totalCost = stockItems.reduce((sum, item) => {
      const itemTotal = (item.cost || 0) * (item.quantity || 0);
      return sum + itemTotal;
    }, 0);

    await PurchaseOrdersCollection.updateAsync(id, { $set: { stockItems, totalCost } });
  }),

  'purchaseOrders.getAll': requireLoginMethod(async function () {
      return PurchaseOrdersCollection.find().fetch();
    }),
});
