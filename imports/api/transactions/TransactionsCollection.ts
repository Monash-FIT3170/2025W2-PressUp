import { Mongo } from "meteor/mongo";
import { DBEntry } from "../database";

export interface Transaction extends DBEntry {
  name: string;
  quantity: number;
  price: number;
  createdAt: Date;
}

export const TransactionsCollection = new Mongo.Collection<Transaction>("transactions");
