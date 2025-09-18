import { Meteor } from "meteor/meteor";
import { ItemCategoriesCollection } from "./ItemCategoriesCollection";
import { requireLoginPublish } from "../accounts/wrappers";

Meteor.publish(
  "itemCategories",
  requireLoginPublish(function () {
    return ItemCategoriesCollection.find();
  }),
);