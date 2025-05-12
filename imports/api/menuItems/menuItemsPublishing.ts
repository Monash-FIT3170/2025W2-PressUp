import { Meteor } from "meteor/meteor";
import { MenuItemsCollection } from "./MenuItemsCollection";

Meteor.publish("menuItems", function () {
  return MenuItemsCollection.find();
});
