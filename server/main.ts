import { Meteor } from "meteor/meteor";
import { StockItemsCollection } from "/imports/api/stock_item";
import { MenuItemsCollection } from "../imports/api/MenuItemsCollection";

const insertMenuItem = (itemName: string, quantity: number, ingredients: string[]) =>
  MenuItemsCollection.insertAsync({
    name: itemName,
    quantity: quantity,
    ingredients: ingredients,
    createdAt: new Date(),
});

Meteor.startup(async () => {
  Meteor.publish("stock_items", function () {
    return StockItemsCollection.find();
  });


  // 
  MenuItemsCollection.dropCollectionAsync()


  // Hardcoded for now
  const pressUpMenuItems: [string, number, string[]][] = [
    ["Soy Latte", Math.floor(Math.random()*10), ["Soy Milk", "Espresso"]],
    ["Beef Burger", Math.floor(Math.random()*10), ["Beef Patty", "Lettuce", "Cheese"]]
  ];

  // Adding menu items to the menuItems databse
  for (let i = 0; i < pressUpMenuItems.length; i++) {
    let itemName = pressUpMenuItems[i][0];
    let quantity = pressUpMenuItems[i][1];
    let ingredients = pressUpMenuItems[i][2];
    
    insertMenuItem(itemName, quantity, ingredients);
  }


});
