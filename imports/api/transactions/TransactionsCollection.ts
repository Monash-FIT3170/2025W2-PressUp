import { Mongo } from "meteor/mongo";
import { DBEntry } from "../database";
import { Order } from "../orders/OrdersCollection";

export interface Transaction extends DBEntry {
  tableNo: number;
  order: Order;
  createdAt: Date;
}

export const TransactionsCollection = new Mongo.Collection<Transaction>("transactions");
export { Order };

