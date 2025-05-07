import { Meteor } from "meteor/meteor";
import { StockItemsCollection } from "../imports/api/StockItemsCollection";
import { MenuItemsCollection } from "../imports/api/MenuItemsCollection";
import "../imports/api/StockMethods";

// Method for inserting new items to menuItems collection
const insertMenuItem = (itemName: string, ingredients: string[], available: boolean, quantity: number) =>
  MenuItemsCollection.insertAsync({
    name: itemName,
    ingredients: ingredients,
    available: available,
    quantity: quantity
});

const insertStockItem = (name: string, quantity: number, location: string, supplier: string) =>
  StockItemsCollection.insertAsync({
    name: name,
    quantity: quantity,
    location: location,
    supplier: supplier
});

const mockStockItems = (amount: number) => {
  const rand = (max: number) => Math.floor(Math.random() * max);
  let result = [];
  for (let i = 0; i < amount; ++i) {
    result.push({
      name: ["Coffee Beans", "Eggs", "Almond Milk"][rand(3)],
      quantity: [0, 999, 100, 10][rand(4)],
      location: `Room ${["4", "1", "2", "33"][rand(4)]}`,
      supplier: `Supplier ${["35", "1", "2", "727"][rand(4)]}`,
      createdAt: new Date(),
    });
  }
  return result;
};

Meteor.startup(async () => {
  await StockItemsCollection.dropCollectionAsync(); 

  if ((await StockItemsCollection.find().countAsync()) === 0) {
    const mockItems = mockStockItems(5);

    for (const item of mockItems) {
      await insertStockItem(item.name, item.quantity, item.location, item.supplier);
    }
  }

  // Dropping menuItems collection when application first runs
  await MenuItemsCollection.dropCollectionAsync()

  // Hardcoded menu items for now
  const pressUpMenuItems: [string, string[], boolean, number][] = [
    ["Soy Latte", ["Soy Milk", "Espresso"], true, Math.floor(Math.random()*10)],
    ["Beef Burger", ["Beef Patty", "Lettuce", "Cheese"], false, Math.floor(Math.random()*10)],
  ];

  // Adding menu items to the menuItems collection
  for (let i = 0; i < pressUpMenuItems.length; i++) {
    let itemName = pressUpMenuItems[i][0];
    let ingredients = pressUpMenuItems[i][1];
    let available = pressUpMenuItems[i][2];
    let quantity = pressUpMenuItems[i][3];

    insertMenuItem(itemName, ingredients, available, quantity);
  }


});