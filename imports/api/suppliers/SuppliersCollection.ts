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
}

export const SuppliersCollection = new Mongo.Collection<Supplier>("suppliers");
