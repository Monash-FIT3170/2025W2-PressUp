import { Mongo } from "meteor/mongo";
import { DBEntry } from "../database";

export interface ItemCategory extends DBEntry<String> {
  _id: string;
  name: string;
}

export const ItemCategoriesCollection = new Mongo.Collection<ItemCategory>("ItemCategories");