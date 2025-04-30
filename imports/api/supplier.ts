import { Mongo } from "meteor/mongo";
import { DBEntry } from "./database";

// TODO: This probably needs to include a field that indicates
// what constitutes "low" in stock (i.e. percentage/fixed quantity set by user)
export interface Supplier extends DBEntry {
  name: string;
}

export const SupplierCollection = new Mongo.Collection<Supplier>("suppliers");
