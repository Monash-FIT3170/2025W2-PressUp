import { Meteor } from "meteor/meteor";
import { StockItemsCollection } from "/imports/api/stock_item";
import { MenuItemsCollection } from "../imports/api/MenuItemsCollection";
import { TransactionsCollection } from "/imports/api/transaction";


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

  // Method for inserting new items into the Transactions Collection
  const insertTransactions = async ([name, quantity, price]: [string, number, number]) => {
    await TransactionsCollection.insertAsync({
      name: name,
      quantity: quantity,
      price: price,
      createdAt: new Date(),
    });
  };


Meteor.startup(async () => {
  Meteor.publish("stock_items", function () {
    return StockItemsCollection.find();
  });


  Meteor.publish("menuItems", function() {
    return MenuItemsCollection.find();
  });

  Meteor.publish("transactions", function() {
    return TransactionsCollection.find();
  });



  // Include for first intialisation of menuItems collection

  // Dropping menuItems collection when application first runs
  MenuItemsCollection.dropCollectionAsync()

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


  // Dropping transactions collection when application first runs
  TransactionsCollection.dropCollectionAsync()

  // Hardcoded transactions menu items for now
  const newTransactions: [string, number, number][] = [
    ["Mocha", Math.floor(1 + Math.random() * 3), 4.80],
    ["Croissant", Math.floor(1 + Math.random() * 3), 5.10],
    ["Muffin", Math.floor(1 + Math.random() * 3), 2.20],
  ];

  // Adding transactions menu items to the transactions collection
  for (let i = 0; i < newTransactions.length; i++) {
    await insertTransactions(newTransactions[i]);
  }

});