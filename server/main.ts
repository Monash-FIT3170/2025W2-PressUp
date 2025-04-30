import { Meteor } from "meteor/meteor";
import { StockItemsCollection } from "/imports/api/stock_item";
import { MenuItemsCollection } from "../imports/api/MenuItemsCollection";

// Method for inserting new items to menuItems collection
const insertMenuItem = (itemName: string, ingredients: string[], available: boolean, quantity: number) =>
  MenuItemsCollection.insertAsync({
    name: itemName,
    ingredients: ingredients,
    available: available,
    quantity: quantity
});

Meteor.startup(async () => {
  Meteor.publish("stock_items", function () {
    return StockItemsCollection.find();
  });


  // Dropping menuItems collection when application first runs
  MenuItemsCollection.dropCollectionAsync()

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
