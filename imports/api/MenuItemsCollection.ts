import { Mongo } from "meteor/mongo";
import { DBEntry } from "./database";

export interface MenuItem extends DBEntry {
  name: string;
  ingredients: string[];
  available: boolean;
  quantity?: number;
  price?: number;
  category?: string[];
}

export const MenuItemsCollection = new Mongo.Collection<MenuItem>("menuItems");
