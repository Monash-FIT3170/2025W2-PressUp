import { Meteor } from "meteor/meteor";
import { MenuItemsCollection } from "./MenuItemsCollection";
import { requireLoginPublish } from "../accounts/wrappers";

Meteor.publish(
  "menuItems",
  requireLoginPublish(function () {
    return MenuItemsCollection.find();
  }),
);
