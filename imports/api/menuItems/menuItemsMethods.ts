import { Meteor } from "meteor/meteor";
import { MenuItem, MenuItemsCollection } from "./MenuItemsCollection";

Meteor.methods({
  async 'menuItems.insert'(item: MenuItem) {
    await MenuItemsCollection.insertAsync(item);
  },

  async 'menuItems.delete'(itemName: string) {
    if (!itemName) {
      throw new Meteor.Error('invalid-name', 'Item name is required');
    }
    await MenuItemsCollection.removeAsync({ name: itemName });
  },

  async 'menuItems.update'(itemName: string, updatedFields: Partial<MenuItem>) {
    if (!itemName || !updatedFields) {
      throw new Meteor.Error('invalid-arguments', 'Item name and updated fields are required');
    }
    await MenuItemsCollection.updateAsync({ name: itemName }, {
      $set: updatedFields
    });
  },

  'menuItems.getAll'() {
    return MenuItemsCollection.find().fetch();
  },

  async 'menuItems.updateQuantity'(itemId: string, change: number) {
    if (!itemId || typeof change !== 'number') {
      throw new Meteor.Error('invalid-arguments', 'Item ID and change number are required');
    }

    const item = await MenuItemsCollection.findOneAsync(itemId);
    if (!item) {
      throw new Meteor.Error('not-found', 'Item not found');
    }

    const newQuantity = Math.max(0, item.quantity + change);
    MenuItemsCollection.updateAsync(itemId, {
      $set: { quantity: newQuantity }
    });
  },


});
