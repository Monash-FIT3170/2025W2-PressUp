import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import {
  ItemCategory,
  ItemCategoriesCollection,
} from "./ItemCategoriesCollection";
import { requireLoginMethod } from "../accounts/wrappers";
import { OmitDB } from "../database";

Meteor.methods({
  "itemCategories.insert": requireLoginMethod(async function (
    category: OmitDB<ItemCategory>,
  ) {
    // Validate the item data
    check(category, {
      name: String,
    });

    // Check if cat with same name already exists
    const existingCat = await ItemCategoriesCollection.findOneAsync({
      name: { $regex: `^${category.name}$`, $options: "i" },
    });
    if (existingCat) {
      throw new Meteor.Error(
        "duplicate-category",
        "A category with this name already exists",
      );
    }

    return await ItemCategoriesCollection.insertAsync(category);
  }),

  "itemCategories.delete": requireLoginMethod(async function (catName: string) {
    check(catName, String);

    if (!catName) {
      throw new Meteor.Error("invalid-name", "Category name is required");
    }

    const result = await ItemCategoriesCollection.removeAsync({
      name: catName,
    });
    if (result === 0) {
      throw new Meteor.Error("not-found", "Category not found");
    }

    return result;
  }),

  "itemCatgeories.getAll": requireLoginMethod(async function () {
    return ItemCategoriesCollection.find().fetch();
  }),

  "itemCategories.insertInitial": requireLoginMethod(async function () {
    const categories: OmitDB<ItemCategory>[] = [
      { name: "Food" },
      { name: "Drink" },
      { name: "Dessert" },
    ];

    // Insert them if they don't already exist
    for (const category of categories) {
      const existing = await ItemCategoriesCollection.findOneAsync({ name: category.name });
      if (!existing) {
        await ItemCategoriesCollection.insertAsync(category);
      }
    }
  }),

});
