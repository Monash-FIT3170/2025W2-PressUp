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
  },

  'menuItems.updateQuantity'(itemId: string, change: number) {
    if (!itemId || typeof change !== 'number') {
      throw new Meteor.Error('invalid-arguments', 'Item ID and change number are required');
    }

    const item = MenuItemsCollection.findOne(itemId);
    if (!item) {
      throw new Meteor.Error('not-found', 'Item not found');
    }

    const newQuantity = Math.max(0, item.quantity + change); 
    MenuItemsCollection.update(itemId, {
      $set: { quantity: newQuantity }
    });
  },

  
});