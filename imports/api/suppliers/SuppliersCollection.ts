import { Mongo } from "meteor/mongo";
import { DBEntry, OmitDB } from "../database";

export interface Supplier extends DBEntry {
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
}

export const SuppliersCollection = new Mongo.Collection<
  OmitDB<Supplier>,
  Supplier
>("suppliers");
