import { Mongo } from "meteor/mongo";
import { DBEntry } from "../database";
import { Order } from "../orders/OrdersCollection";

export interface Tables extends DBEntry {
  tableNo: number;
  order: Order | null;
  capacity: number;
  isOccupied: boolean;
  noOccupants: number;
}

export const TablesCollection = new Mongo.Collection<Tables>("tables");