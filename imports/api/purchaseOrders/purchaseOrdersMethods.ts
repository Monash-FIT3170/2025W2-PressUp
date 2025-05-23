import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import {
  PurchaseOrdersCollection,
  StockItemLine,
} from "./PurchaseOrdersCollection";

Meteor.methods({
  async "purchaseOrders.new"({ supplierId }: { supplierId: Mongo.ObjectID }) {
    const number = await PurchaseOrdersCollection.countDocuments();
    return await PurchaseOrdersCollection.insertAsync({
      supplier: supplierId,
      number,
      stockItems: [],
      date: new Date(),
    });
  },

  async "purchaseOrders.update"({
    id,
    stockItems,
  }: {
    id: Mongo.ObjectID;
    stockItems: StockItemLine[];
  }) {
    check(id, String);
    check(stockItems, Array);

    await PurchaseOrdersCollection.updateAsync(id, { $set: { stockItems } });
  },
});
