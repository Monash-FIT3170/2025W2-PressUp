import { Mongo } from "meteor/mongo";
import { DBEntry, OmitDB } from "../database";

export interface MenuItem extends DBEntry {
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

export const MenuItemsCollection = new Mongo.Collection<
  OmitDB<MenuItem>,
  MenuItem
>("menuItems");
