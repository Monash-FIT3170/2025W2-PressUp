import { Mongo } from "meteor/mongo";
import { DBEntry } from "./database";

export interface MenuItem extends DBEntry {
  _id: string;
  createdAt: Date;
  name: string;
  quantity: number;
  ingredients: string[];
}

export const MenuItemsCollection = new Mongo.Collection<MenuItem>("menuItems");
