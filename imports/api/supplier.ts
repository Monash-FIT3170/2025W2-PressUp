import { Mongo } from "meteor/mongo";
import { DBEntry } from "./database";

export interface Supplier extends DBEntry {
  name: string;
}

export const SupplierCollection = new Mongo.Collection<Supplier>("suppliers");
