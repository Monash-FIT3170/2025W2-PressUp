import { Mongo } from "meteor/mongo";
import { DBEntry } from "../database";
import { ItemCategory } from "./ItemCategoriesCollection";

export interface MenuItem extends DBEntry {
  _id: string;
  name: string;
  quantity: number;
  ingredients: string[];
  available: boolean;
  price: number;
  category?: ItemCategory[];
  allergens?: string[];
  image: string;
  discount?: number;
}

export const MenuItemsCollection = new Mongo.Collection<MenuItem>("menuItems");
