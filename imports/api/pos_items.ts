import { Mongo } from "meteor/mongo";
import { DBEntry } from "./database";

// TODO: In the future, consider adding more details this is mock up design first of all (e.g., drink, food)

export interface PosItem extends DBEntry {
    name: string;
    price: number;
    imageUrl: string; // path : /punlic/menu_items/...png
}

export const PosItemsCollection = new Mongo.Collection<PosItem>("pos_items");