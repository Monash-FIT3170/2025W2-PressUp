import { Mongo } from "meteor/mongo";
import { DBEntry } from "../database";

export interface Tables extends DBEntry {
  tableNo: number;
  orderNo?: number;
  capacity: number;
  isOccupied: boolean;
  noOccupants: number;
}

export const TablesCollection = new Mongo.Collection<Tables>("tables");