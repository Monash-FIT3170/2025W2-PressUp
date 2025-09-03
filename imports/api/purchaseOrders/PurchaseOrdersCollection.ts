import { Mongo } from "meteor/mongo";
import { DBEntry, IdType, OmitDB } from "../database";

export interface StockItemLine {
  stockItem: IdType;
  quantity: number;
  cost: number;
}

export interface PurchaseOrder extends DBEntry {
  supplier: IdType;
  number: number;
  stockItems: StockItemLine[];
  totalCost: number;
  date: Date;
}

export const PurchaseOrdersCollection = new Mongo.Collection<
  OmitDB<PurchaseOrder>,
  PurchaseOrder
>("purchaseOrders");
