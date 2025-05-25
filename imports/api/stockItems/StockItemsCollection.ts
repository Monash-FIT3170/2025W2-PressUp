import { Mongo } from "meteor/mongo";
import { DBEntry } from "../database";

// TODO: This probably needs to include a field that indicates
// what constitutes "low" in stock (i.e. percentage/fixed quantity set by user)
export interface StockItem extends DBEntry<String> {
  _id: string;
  name: string;
  quantity: number;
  location: string; // TODO: This may need to be its own collection?
  supplier: Mongo.ObjectID | null;
}

export const StockItemsCollection = new Mongo.Collection<StockItem>(
  "stockItems",
);
