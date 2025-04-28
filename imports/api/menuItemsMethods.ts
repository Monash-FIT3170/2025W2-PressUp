import { Meteor } from "meteor/meteor";
import { MenuItem, MenuItemsCollection } from "./MenuItemsCollection";

Meteor.methods({
  'menuItems.insert'(item: MenuItem) {
    MenuItemsCollection.insert(item);
  }
});