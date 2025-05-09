import { Mongo } from "meteor/mongo";
import { DBEntry } from "../database";

export interface Supplier extends DBEntry {
  name: string;
  description: string;
  pastOrderQty: number;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  goods: string[]; // TODO: This may need to be determined programmatically
}

export const SuppliersCollection = new Mongo.Collection<Supplier>("suppliers");
