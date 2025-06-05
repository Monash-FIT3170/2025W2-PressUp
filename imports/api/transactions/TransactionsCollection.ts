import { Mongo } from "meteor/mongo";
import { DBEntry } from "../database";
import { Order } from "../orders/OrdersCollection";

export interface Transaction extends DBEntry {
  order: Order;
  // discount: number;
  paidAt: Date;
}

export const TransactionsCollection = new Mongo.Collection<Transaction>("transactions");
