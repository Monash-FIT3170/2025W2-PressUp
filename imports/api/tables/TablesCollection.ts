import { Mongo } from "meteor/mongo";
import { DBEntry } from "../database";

export interface Tables extends DBEntry {
  tableNo: number;
  orderNo?: number;
  capacity: number;
  occupied: boolean;
  noOccupants: number;
}

export const TablesCollection = new Mongo.Collection<Tables>("tables");