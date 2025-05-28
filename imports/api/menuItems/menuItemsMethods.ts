import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { MenuItem, MenuItemsCollection } from "./MenuItemsCollection";

Meteor.methods({
  async 'menuItems.insert'(item: Omit<MenuItem, '_id'>) {
    // Validate the item data
    check(item, {
      name: String,
      quantity: Number,
      ingredients: [String],
      available: Boolean,
      price: Number,
      category: Match.Optional([String]),
      image: String,
      // DBEntry fields
      createdAt: Match.Optional(Date),
      updatedAt: Match.Optional(Date)
    });

    // Check if item with same name already exists
    const existingItem = await MenuItemsCollection.findOneAsync({ name: item.name });
    if (existingItem) {
      throw new Meteor.Error('duplicate-item', 'An item with this name already exists');
    }

    // Validate price is not negative
    if (item.price < 0) {
      throw new Meteor.Error('invalid-price', 'Price cannot be negative');
    }

    // Validate quantity is not negative
    if (item.quantity < 0) {
      throw new Meteor.Error('invalid-quantity', 'Quantity cannot be negative');
    }

    // Add timestamps if not provided
    const itemWithTimestamps = {
      ...item,
      createdAt: item.createdAt || new Date(),
      updatedAt: item.updatedAt || new Date()
    };

    return await MenuItemsCollection.insertAsync(itemWithTimestamps);
  },

  async 'menuItems.delete'(itemName: string) {
    check(itemName, String);
    
    if (!itemName) {
      throw new Meteor.Error('invalid-name', 'Item name is required');
    }
    
    const result = await MenuItemsCollection.removeAsync({ name: itemName });
    if (result === 0) {
      throw new Meteor.Error('not-found', 'Item not found');
    }
    
    return result;
  },

  async 'menuItems.update'(itemName: string, updatedFields: Partial<Omit<MenuItem, '_id'>>) {
    check(itemName, String);
    check(updatedFields, Object);
    
    if (!itemName || !updatedFields) {
      throw new Meteor.Error('invalid-arguments', 'Item name and updated fields are required');
    }

    // Validate updated fields
    if (updatedFields.price !== undefined && updatedFields.price < 0) {
      throw new Meteor.Error('invalid-price', 'Price cannot be negative');
    }

    if (updatedFields.quantity !== undefined && updatedFields.quantity < 0) {
      throw new Meteor.Error('invalid-quantity', 'Quantity cannot be negative');
    }

    // Add updated timestamp
    const fieldsWithTimestamp = {
      ...updatedFields,
      updatedAt: new Date()
    };

    const result = await MenuItemsCollection.updateAsync(
      { name: itemName }, 
      { $set: fieldsWithTimestamp }
    );

    if (result === 0) {
      throw new Meteor.Error('not-found', 'Item not found');
    }

    return result;
  },

  'menuItems.getAll'() {
    return MenuItemsCollection.find().fetch();
  },

  async 'menuItems.updateQuantity'(itemId: string, change: number) {
    check(itemId, String);
    check(change, Number);
    
    if (!itemId || typeof change !== 'number') {
      throw new Meteor.Error('invalid-arguments', 'Item ID and change number are required');
    }

    const item = await MenuItemsCollection.findOneAsync(itemId);
    if (!item) {
      throw new Meteor.Error('not-found', 'Item not found');
    }

    const newQuantity = Math.max(0, item.quantity + change);
    const result = await MenuItemsCollection.updateAsync(itemId, {
      $set: { 
        quantity: newQuantity,
        updatedAt: new Date()
      }
    });

    return result;
  },

  // Additional helper methods using your interface
  async 'menuItems.getByCategory'(categories: string[]) {
    check(categories, [String]);
    return MenuItemsCollection.find({ 
      category: { $in: categories } 
    }).fetch();
  },

  async 'menuItems.getByName'(name: string) {
    check(name, String);
    return await MenuItemsCollection.findOneAsync({ name });
  },

  async 'menuItems.toggleAvailability'(itemName: string) {
    check(itemName, String);
    
    const item = await MenuItemsCollection.findOneAsync({ name: itemName });
    if (!item) {
      throw new Meteor.Error('not-found', 'Item not found');
    }

    const result = await MenuItemsCollection.updateAsync(
      { name: itemName },
      { 
        $set: { 
          available: !item.available,
          updatedAt: new Date()
        }
      }
    );

    return result;
  },

  async 'menuItems.getAvailable'() {
    return MenuItemsCollection.find({ available: true }).fetch();
  },

  async 'menuItems.searchByIngredient'(ingredient: string) {
    check(ingredient, String);
    return MenuItemsCollection.find({ 
      ingredients: { $regex: ingredient, $options: 'i' } 
    }).fetch();
  }
});