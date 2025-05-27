import { Mongo } from "meteor/mongo";
import { DBEntry } from "../database";

export interface MenuItem extends DBEntry {
  _id: Mongo.ObjectID;
  name: string;
  quantity: number;
  ingredients: string[];
  available: boolean;
  price: number;
  category?: string[];
  allergens?: string[];
  image: string;
  discount?: number;
}

export const MenuItemsCollection = new Mongo.Collection<MenuItem>("menuItems");
