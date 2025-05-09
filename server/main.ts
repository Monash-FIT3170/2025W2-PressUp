import { Meteor } from "meteor/meteor";
import { StockItemsCollection } from "../imports/api/StockItemsCollection";
import { MenuItemsCollection } from "../imports/api/MenuItemsCollection";
import "../imports/api/StockMethods";


// Method for inserting new items to menuItems collection
const insertMenuItem = (itemName: string, ingredients: string[], available: boolean, quantity: number, price: number, image: string) =>
  MenuItemsCollection.insertAsync({
    name: itemName,
    quantity: quantity,
    ingredients: ingredients,
    price: price,
    available: available,
    image: image,
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

  Meteor.publish("menuItems", function() {
    return MenuItemsCollection.find();
  });


  // Include for first intialisation of menuItems collection

  // Dropping menuItems collection when application first runs
  await MenuItemsCollection.dropCollectionAsync()

  // Hardcoded menu items for now
  const pressUpMenuItems: [string, number, string[], number][] = [
    // ["Soy Latte", Math.floor(Math.random()*10), ["Soy Milk", "Espresso"], 5.10],
    // ["Beef Burger", Math.floor(Math.random()*10), ["Beef Patty", "Lettuce", "Cheese"], 6.80],
    ["Mocha", Math.floor(Math.random()*10), ["Espresso", "Chocolate"], 4.80 ],
    ["Cappuccino", Math.floor(Math.random()*10), ["Espresso", "Foamed Milk"], 4.90],
    ["Flat White", Math.floor(Math.random()*10), ["Espresso", "Steamed Milk"], 5.00],
    ["Macchiato", Math.floor(Math.random()*10), ["Espresso", "Foam"], 4.70],
    ["Cookie", Math.floor(Math.random()*10), ["Flour", "Chocolate Chips"], 2.70],
    ["Croissant", Math.floor(Math.random()*10), ["Flour", "Butter"], 5.10],
    ["Muffin", Math.floor(Math.random()*10), ["Flour", "Butter", "Choc Chip"], 2.20],
  ];

  const noItems = 12

  // Adding menu items to the menuItems collection
  for (let i = 0; i < noItems; i++) {
    let itemName = pressUpMenuItems[i%pressUpMenuItems.length][0];
    let quantity = pressUpMenuItems[i%pressUpMenuItems.length][1];
    let ingredients = pressUpMenuItems[i%pressUpMenuItems.length][2];
    let price = pressUpMenuItems[i%pressUpMenuItems.length][3];
    const image = `/menu_items/${itemName.toLowerCase()}.png`
    
    insertMenuItem(itemName, ingredients, true, quantity, price, image);
  }


});