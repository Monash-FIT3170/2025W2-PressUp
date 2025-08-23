import { Mongo } from "meteor/mongo";
import { DBEntry, IdType, OmitDB } from "../database";

export interface Tables extends DBEntry {
  tableNo: number;
  orderID: IdType | null;
  capacity: number;
  isOccupied: boolean;
  noOccupants: number;
}

export const TablesCollection = new Mongo.Collection<OmitDB<Tables>, Tables>("tables");
