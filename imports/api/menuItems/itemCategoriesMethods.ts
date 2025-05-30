import { Meteor } from 'meteor/meteor';
import { ItemCategory, ItemCategoriesCollection } from './ItemCategoriesCollection';
import { check } from "meteor/check";

Meteor.methods({

  'itemCategories.getAll'() {
    return ItemCategoriesCollection.find().fetch();
  },

  async "itemCategories.add"(name: string) {
    check(name, String);
    if (!name.trim()) {
      throw new Meteor.Error("invalid-category", "Category name cannot be empty");
    }

    // Check if category already exists
    const item = await ItemCategoriesCollection.findOneAsync({ name });
    if (item) {
      throw new Meteor.Error("duplicate-category", "Category already exists");
    }

    ItemCategoriesCollection.insertAsync({ name });
  },

  async 'itemCategories.delete'(categoryName: string) {
    check(categoryName, String);

    if (!categoryName) {
      throw new Meteor.Error('invalid-name', 'Item name is required');
    }

    const result = await ItemCategoriesCollection.removeAsync({ name: categoryName });
    if (result === 0) {
      throw new Meteor.Error('not-found', 'Item not found');
    }

    return result;
  },

});
