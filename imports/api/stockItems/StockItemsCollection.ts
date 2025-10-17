import { Mongo } from "meteor/mongo";
import { DBEntry, IdType, OmitDB } from "../database";

export interface StockLineItem {
  id: IdType;
  quantity: number;
  location: string;
  expiry: Date | null;
}

export interface StockItem extends DBEntry {
  name: string;
  supplier: IdType | null;
  lineItems: StockLineItem[];
}

export const StockItemsCollection = new Mongo.Collection<
  OmitDB<StockItem>,
  StockItem
>("stockItems");
