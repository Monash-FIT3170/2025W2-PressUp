import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { MenuItem, MenuItemsCollection } from "./MenuItemsCollection";
import { requireLoginMethod } from "../accounts/wrappers";
import { IdType, OmitDB } from "../database";
import type { BaseIngredient, OptionGroup } from "./MenuItemsCollection";

// Define reusable schemas
const BaseIngredientSchema: any = Match.ObjectIncluding({
  key: String,
  label: String,
  default: Boolean,
  removable: Match.Optional(Boolean),
  priceDelta: Match.Optional(Number),
});

const OptionSchema: any = Match.ObjectIncluding({
  key: String,
  label: String,
  priceDelta: Match.Optional(Number),
  default: Match.Optional(Boolean),
});

const OptionGroupSchema: any = Match.ObjectIncluding({
  id: String,
  label: String,
  type: Match.OneOf("single", "multiple"),
  required: Match.Optional(Boolean),
  options: [OptionSchema],
});

Meteor.methods({
  "menuItems.insert": requireLoginMethod(async function (
    item: OmitDB<MenuItem>,
  ) {
    // Validate the item data
    check(item, {
      name: String,
      quantity: Number,
      ingredients: Match.Optional([String]), // Optional for backward compatibility
      available: Boolean,
      price: Number,
      category: Match.Optional([String]),
      image: String,
      // New fields
      baseIngredients: Match.Optional([BaseIngredientSchema]),
      optionGroups: Match.Optional([OptionGroupSchema]),
      // DBEntry fields
      createdAt: Match.Optional(Date),
      updatedAt: Match.Optional(Date),
    });

    // Automatically generate ingredients if not provided
    let ingredients = item.ingredients;
    if ((!ingredients || ingredients.length === 0) && item.baseIngredients) {
      const base = (item.baseIngredients ?? [])
        .filter((b: BaseIngredient) => b.default)
        .map((b: BaseIngredient) => b.label);

      type GroupOption = OptionGroup["options"][number];
      const groupDefaults = (item.optionGroups ?? []).flatMap(
        (g: OptionGroup) =>
          g.options
            .filter((o: GroupOption) => o.default)
            .map((o: GroupOption) => o.label),
      );

      ingredients = [...base, ...groupDefaults];
    }

    // Check if item with the same name already exists
    const existingItem = await MenuItemsCollection.findOneAsync({
      name: item.name,
    });
    if (existingItem) {
      throw new Meteor.Error(
        "duplicate-item",
        "An item with this name already exists",
      );
    }

    // Validate price is not negative
    if (item.price < 0) {
      throw new Meteor.Error("invalid-price", "Price cannot be negative");
    }

    // Validate quantity is not negative
    if (item.quantity < 0) {
      throw new Meteor.Error("invalid-quantity", "Quantity cannot be negative");
    }

    // Add timestamps if not provided
    const itemWithTimestamps = {
      ...item,
      ingredients: ingredients || [], // Ensure ingredients is always an array
      createdAt: item.createdAt || new Date(),
      updatedAt: item.updatedAt || new Date(),
    };

    return await MenuItemsCollection.insertAsync(itemWithTimestamps);
  }),

  "menuItems.delete": requireLoginMethod(async function (itemName: string) {
    check(itemName, String);

    if (!itemName) {
      throw new Meteor.Error("invalid-name", "Item name is required");
    }

    const result = await MenuItemsCollection.removeAsync({ name: itemName });
    if (result === 0) {
      throw new Meteor.Error("not-found", "Item not found");
    }

    return result;
  }),

  "menuItems.update": requireLoginMethod(async function (
    itemName: string,
    updatedFields: Partial<OmitDB<MenuItem>>,
  ) {
    check(itemName, String);
    check(updatedFields, {
      name: Match.Optional(String),
      quantity: Match.Optional(Number),
      ingredients: Match.Optional([String]),
      available: Match.Optional(Boolean),
      price: Match.Optional(Number),
      category: Match.Optional([String]),
      allergens: Match.Optional([String]),
      image: Match.Optional(String),
      discount: Match.Optional(Number),
      baseIngredients: Match.Optional([BaseIngredientSchema]),
      optionGroups: Match.Optional([OptionGroupSchema]),
      updatedAt: Match.Optional(Date),
    });

    if (!itemName || !updatedFields) {
      throw new Meteor.Error(
        "invalid-arguments",
        "Item name and updated fields are required",
      );
    }

    // Validate updated fields
    if (updatedFields.price !== undefined && updatedFields.price < 0) {
      throw new Meteor.Error("invalid-price", "Price cannot be negative");
    }

    if (updatedFields.quantity !== undefined && updatedFields.quantity < 0) {
      throw new Meteor.Error("invalid-quantity", "Quantity cannot be negative");
    }

    // Add updated timestamp
    const fieldsWithTimestamp = {
      ...updatedFields,
      updatedAt: new Date(),
    };

    const result = await MenuItemsCollection.updateAsync(
      { name: itemName },
      { $set: fieldsWithTimestamp },
    );

    if (result === 0) {
      throw new Meteor.Error("not-found", "Item not found");
    }

    return result;
  }),

  "menuItems.getAll": requireLoginMethod(async function () {
    return MenuItemsCollection.find().fetch();
  }),

  "menuItems.updateQuantity": requireLoginMethod(async function (
    itemId: IdType,
    change: number,
  ) {
    check(itemId, String);
    check(change, Number);

    if (!itemId || typeof change !== "number") {
      throw new Meteor.Error(
        "invalid-arguments",
        "Item ID and change number are required",
      );
    }

    const item = await MenuItemsCollection.findOneAsync(itemId);
    if (!item) {
      throw new Meteor.Error("not-found", "Item not found");
    }

    const newQuantity = Math.max(0, item.quantity + change);
    const result = await MenuItemsCollection.updateAsync(itemId, {
      $set: {
        quantity: newQuantity,
        updatedAt: new Date(),
      },
    });

    return result;
  }),

  // Additional helper methods using your interface
  "menuItems.getByCategory": requireLoginMethod(async function (
    categories: string[],
  ) {
    check(categories, [String]);
    return MenuItemsCollection.find({
      category: { $in: categories },
    }).fetch();
  }),

  "menuItems.getByName": requireLoginMethod(async function (name: string) {
    check(name, String);
    return await MenuItemsCollection.findOneAsync({ name });
  }),

  "menuItems.toggleAvailability": requireLoginMethod(async function (
    itemName: string,
  ) {
    check(itemName, String);

    const item = await MenuItemsCollection.findOneAsync({ name: itemName });
    if (!item) {
      throw new Meteor.Error("not-found", "Item not found");
    }

    const result = await MenuItemsCollection.updateAsync(
      { name: itemName },
      {
        $set: {
          available: !item.available,
          updatedAt: new Date(),
        },
      },
    );

    return result;
  }),

  "menuItems.getAvailable": requireLoginMethod(async function () {
    return MenuItemsCollection.find({ available: true }).fetch();
  }),

  "menuItems.searchByIngredient": requireLoginMethod(async function (
    ingredient: string,
  ) {
    check(ingredient, String);
    return MenuItemsCollection.find({
      ingredients: { $regex: ingredient, $options: "i" },
    }).fetch();
  }),
});
