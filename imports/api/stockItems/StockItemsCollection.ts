import { Mongo } from "meteor/mongo";
import { DBEntry, IdType, OmitDB } from "../database";

// TODO: This probably needs to include a field that indicates
// what constitutes "low" in stock (i.e. percentage/fixed quantity set by user)
export interface StockItem extends DBEntry {
  name: string;
  quantity: number;
  location: string; // TODO: This may need to be its own collection?
  supplier: IdType | null;
}

export const StockItemsCollection = new Mongo.Collection<
  OmitDB<StockItem>,
  StockItem
>("stockItems");
