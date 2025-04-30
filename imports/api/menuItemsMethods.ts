import { Meteor } from "meteor/meteor";
import { MenuItem, MenuItemsCollection } from "./MenuItemsCollection";

Meteor.methods({
  'menuItems.insert'(item: MenuItem) {
    MenuItemsCollection.insertAsync(item);
  },

  'menuItems.delete'(itemName: string) {
    if (!itemName) {
      throw new Meteor.Error('invalid-name', 'Item name is required');
    }
    MenuItemsCollection.removeAsync({ name: itemName });
  },

  'menuItems.update'(itemName: string, updatedFields: Partial<MenuItem>) {
    if (!itemName || !updatedFields) {
      throw new Meteor.Error('invalid-arguments', 'Item name and updated fields are required');
    }
    MenuItemsCollection.updateAsync({ name: itemName }, {
      $set: updatedFields
    });
  },

  'menuItems.getAll'() {
    return MenuItemsCollection.find().fetch();
  }
});