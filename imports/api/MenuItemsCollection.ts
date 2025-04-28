import { Mongo } from "meteor/mongo";
import { DBEntry } from "./database";

// TODO: In the future, consider adding more details this is mock up design first of all (e.g., drink, food)

export interface MenuItem extends DBEntry {
    name: string;
    quantity: number;
    ingredients: string[];
    price: number;
    imageUrl: string; // path : /punlic/menu_items/...png
    amount: number; // TODO: This may need to be in database
}
// TODO: This needs to be a collection. I just created mock data for now
export const MenuItemsCollection = new Mongo.Collection<MenuItem>("menuItems");


export const mainPosItems = (count: number): MenuItem[] => {
    const names = ["Latte", "Mocha", "Cappuccino", "Flat White", "Macchiato", "Iced Latte", "Croissant", "Muffin", "Cookie"];
    const prices = [4.00, 4.50, 5.00, 5.00, 5.50, 6.00, 7.00, 5.00, 4.50];
    const imageNames = ["latte", "mocha", "cappuccino", "flat_white", "macchiato", "iced_latte", "croissant", "muffin", "cookie"];
    const ingredientsPool = [
      ["Espresso", "Milk"], ["Espresso", "Chocolate"], ["Espresso", "Foamed Milk"],
      ["Espresso", "Steamed Milk"], ["Espresso", "Foam"], ["Espresso", "Ice", "Milk"],
      ["Butter", "Flour"], ["Flour", "Blueberries"], ["Flour", "Chocolate Chips"]
    ];
  
    const result: MenuItem[] = [];
  
    for (let i = 0; i < count; i++) {
      const index = i % names.length;
      result.push({
        _id: (i + 1).toString(),
        name: names[index],
        price: prices[index],
        imageUrl: `/menu_items/${imageNames[index]}.png`,
        createdAt: new Date(),
        quantity: Math.floor(Math.random() * 100),
        ingredients: ingredientsPool[index],       
        amount: 0,
      });
    }
  
    return result;
  };