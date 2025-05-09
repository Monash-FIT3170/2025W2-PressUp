import { Mongo } from "meteor/mongo";
import { DBEntry } from "./database";

export interface MenuItem extends DBEntry {
  name: string;
  quantity: number;
  ingredients: string[];
  available: boolean;
  price: number;
  category?: string[];
  image: string;
}

export const MenuItemsCollection = new Mongo.Collection<MenuItem>("menuItems");
