import { Meteor } from "meteor/meteor";
import { MenuItem, MenuItemsCollection } from "./MenuItemsCollection";

Meteor.methods({
  'menuItems.insert'(item: MenuItem) {
    MenuItemsCollection.insert(item);
  },

  'menuItems.delete'(itemName: string) {
    if (!itemName) {
      throw new Meteor.Error('invalid-name', 'Item name is required');
    }
    MenuItemsCollection.remove({ name: itemName });
  },

  'menuItems.update'(itemName: string, updatedFields: Partial<MenuItem>) {
    if (!itemName || !updatedFields) {
      throw new Meteor.Error('invalid-arguments', 'Item name and updated fields are required');
    }
    MenuItemsCollection.update({ name: itemName }, {
      $set: updatedFields
    });
  },

  'menuItems.getAll'() {
    return MenuItemsCollection.find().fetch();
  }
});