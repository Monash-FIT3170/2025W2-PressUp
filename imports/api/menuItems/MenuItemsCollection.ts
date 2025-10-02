import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import SimpleSchema from "simpl-schema";
import type { DBEntry, OmitDB } from "../database";

export type BaseIngredient = {
  key: string;
  label: string;
  default: boolean;
  removable?: boolean;
  priceDelta?: number;
};

export type OptionGroup = {
  id: string;
  label: string;
  type: "single" | "multiple";
  required?: boolean;
  options: Array<{
    key: string;
    label: string;
    priceDelta?: number;
    default?: boolean;
  }>;
};

export interface MenuItem extends DBEntry {
  name: string;
  quantity: number;
  ingredients?: string[];
  available: boolean;
  price: number;
  category?: string[];
  allergens?: string[];
  image?: string;
  discount?: number;
  baseIngredients?: BaseIngredient[];
  optionGroups?: OptionGroup[];
}

export const MenuItemsCollection =
  new Mongo.Collection<OmitDB<MenuItem>, MenuItem>("menuItems");

const BaseIngredientSchema = new SimpleSchema({
  key: String,
  label: String,
  default: Boolean,
  removable: { type: Boolean, optional: true },
  priceDelta: { type: Number, optional: true },
});

const OptionSchema = new SimpleSchema({
  key: String,
  label: String,
  priceDelta: { type: Number, optional: true },
  default: { type: Boolean, optional: true },
});

const OptionGroupSchema = new SimpleSchema({
  id: String,
  label: String,
  type: { type: String, allowedValues: ["single", "multiple"] },
  required: { type: Boolean, optional: true },
  options: { type: Array },
  "options.$": OptionSchema,
});

export const MenuItemSchema = new SimpleSchema({
  name: String,
  quantity: Number,
  available: Boolean,
  price: Number,
  ingredients: { type: Array, optional: true },
  "ingredients.$": String,
  category: { type: Array, optional: true },
  "category.$": String,
  image: { type: String, optional: true },
  discount: { type: Number, optional: true },
  baseIngredients: { type: Array, optional: true },
  "baseIngredients.$": BaseIngredientSchema,
  optionGroups: { type: Array, optional: true },
  "optionGroups.$": OptionGroupSchema,
  createdAt: { type: Date, optional: true },
  updatedAt: { type: Date, optional: true },
});

if (Meteor.isServer) {
  const anyCol = MenuItemsCollection as any;
  if (typeof anyCol.attachSchema === "function") {
    anyCol.attachSchema(MenuItemSchema);
  }
}
