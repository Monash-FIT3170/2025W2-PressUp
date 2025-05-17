import { Mongo } from "meteor/mongo";
import { DBEntry } from "../database";

export interface PurchaseOrder extends DBEntry {
  stockItem: Mongo.ObjectID;
  quantity: number;
  cost: number;
  date: Date;
}

export const PurchaseOrdersCollection = new Mongo.Collection<PurchaseOrder>(
  "purchaseOrders",
);
