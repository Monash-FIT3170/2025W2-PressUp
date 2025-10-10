import { Mongo } from "meteor/mongo";
import { DBEntry, OmitDB } from "../database";

export interface ItemCategory extends DBEntry {
  name: string;
}

export const ItemCategoriesCollection = new Mongo.Collection<
  OmitDB<ItemCategory>,
  ItemCategory
>("itemCategories");
