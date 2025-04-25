import { Mongo } from "meteor/mongo";
import { DBEntry } from "./database";

// TODO: In the future, consider adding more details this is mock up design first of all (e.g., drink, food)

export interface PosItem extends DBEntry {
    name: string;
    price: number;
    imageUrl: string; // path : /punlic/menu_items/...png
}

export const PosItemsCollection = new Mongo.Collection<PosItem>("pos_items");


export const mainPosItems = (count: number): PosItem[] => {
    const names = ["Latte", "Mocha", "Cappuccino", "Flat White", "Macchiato", "Iced Latte", "Croissant", "Muffin", "Cookie"];
    const prices = [4.0, 4.5, 5.0, 3.0, 5.5, 6.0, 7.0, 5.0, 4.5];
    const imageNames = ["latte", "mocha", "cappuccino", "flat_white", "macchiato", "iced_latte", "croissant", "muffin", "cookie"];
  
    const result: PosItem[] = [];
  
    for (let i = 0; i < count; i++) {
      const index = i % names.length;
      result.push({
        _id: (i + 1).toString(),
        name: names[index],
        price: prices[index],
        imageUrl: `/menu_items/${imageNames[index]}.png`,
        createdAt: new Date(),
      });
    }
  
    return result;
  };