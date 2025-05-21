import { Mongo } from "meteor/mongo";
import { DBEntry } from "../database";

export interface StockItemLine {
  stockItem: Mongo.ObjectID;
  quantity: number;
  cost: number;
}

export interface PurchaseOrder extends DBEntry {
  stockItems: StockItemLine[];
  date: Date;
}

export const PurchaseOrdersCollection = new Mongo.Collection<PurchaseOrder>(
  "purchaseOrders",
);
