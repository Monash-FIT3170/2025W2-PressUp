import { MenuItemsCollection, MenuItem } from "./MenuItemsCollection";
import type { OmitDB } from "../database";
import { ItemCategoriesCollection } from "./ItemCategoriesCollection";

export const fixedMenuItems: OmitDB<MenuItem>[] = [
  /* ---------------- Food ---------------- */
  {
    name: "Beef Burger",
    ingredients: [
      "bun",
      "lettuce",
      "cheese",
      "tomato",
      "beef patty",
      "onion",
      "sauce",
    ],
    available: true,
    quantity: 20,
    price: 9.0,
    category: ["Food"],
    image: "/menu_items/beef burger.png",

    baseIngredients: [
      { key: "bun", label: "Bun", default: true, removable: false },
      { key: "patty", label: "Beef Patty", default: true, removable: false },
      { key: "onion", label: "Onion", default: true, removable: true },
      { key: "cheese", label: "Cheese", default: true, removable: true },
      { key: "lettuce", label: "Lettuce", default: true, removable: true },
      { key: "tomato", label: "Tomato", default: true, removable: true },
      { key: "sauce", label: "Sauce", default: true, removable: true },
    ],
    optionGroups: [
      {
        id: "doneness",
        label: "Patty Doneness",
        type: "single",
        options: [
          { key: "mr", label: "Medium Rare" },
          { key: "m", label: "Medium", default: true },
          { key: "mw", label: "Medium Well" },
          { key: "w", label: "Well Done" },
        ],
      },
    ],
  },
  {
    name: "Cookie",
    ingredients: ["flour", "sugar", "chocolate chips", "butter"],
    available: true,
    quantity: 40,
    price: 3.0,
    category: ["Food"],
    image: "/menu_items/cookie.png",
    baseIngredients: [
      { key: "dough", label: "Cookie Dough", default: true, removable: false },
      { key: "chips", label: "Chocolate Chips", default: true, removable: true },
    ],
  },
  {
    name: "Croissant",
    ingredients: ["flour", "butter", "yeast", "milk"],
    available: false,
    quantity: 30,
    price: 4.5,
    category: ["Food"],
    image: "/menu_items/croissant.png",
    baseIngredients: [
      { key: "dough", label: "Croissant Dough", default: true, removable: false },
      { key: "butter", label: "Butter", default: true, removable: false },
    ],
  },
  {
    name: "Muffin",
    ingredients: ["flour", "sugar", "blueberries", "butter"],
    available: true,
    quantity: 30,
    price: 3.5,
    category: ["Food"],
    image: "/menu_items/muffin.png",
    baseIngredients: [
      { key: "base", label: "Muffin Base", default: true, removable: false },
      { key: "blueberry", label: "Blueberries", default: true, removable: true },
    ],
  },

  /* ---------------- Drinks ---------------- */
  {
    name: "Cappuccino",
    ingredients: ["espresso", "steamed milk", "milk foam"],
    price: 5.0,
    quantity: 50,
    available: true,
    category: ["Drink"],
    image: "/menu_items/cappuccino.png",
    baseIngredients: [
      { key: "espresso", label: "Espresso", default: true, removable: false },
      { key: "milk", label: "Steamed milk", default: true, removable: true },
      { key: "foam", label: "Milk foam", default: true, removable: true },
    ],
    optionGroups: [
      {
        id: "milk-type",
        label: "Milk type",
        type: "single",
        required: true,
        options: [
          { key: "full", label: "Full cream", default: true },
          { key: "almond", label: "Almond milk", priceDelta: 0.5 },
          { key: "oat", label: "Oat milk", priceDelta: 0.6 },
        ],
      },
    ],
  },
  {
    name: "Flat White",
    ingredients: ["espresso", "steamed milk"],
    available: true,
    quantity: 35,
    price: 5.0,
    category: ["Drink"],
    image: "/menu_items/flat white.png",
    baseIngredients: [
      { key: "espresso", label: "Espresso", default: true, removable: false },
      { key: "milk", label: "Steamed milk", default: true, removable: true },
    ],
    optionGroups: [
      {
        id: "milk-type",
        label: "Milk type",
        type: "single",
        required: true,
        options: [
          { key: "full", label: "Full cream", default: true },
          { key: "almond", label: "Almond milk", priceDelta: 0.5 },
          { key: "oat", label: "Oat milk", priceDelta: 0.6 },
        ],
      },
    ],
  },
  {
    name: "Iced Latte",
    ingredients: ["espresso", "milk", "ice"],
    available: true,
    quantity: 25,
    price: 5.5,
    category: ["Drink"],
    image: "/menu_items/iced latte.png",
    baseIngredients: [
      { key: "espresso", label: "Espresso", default: true, removable: false },
      { key: "milk", label: "Milk", default: true, removable: true },
      { key: "ice", label: "Ice", default: true, removable: true },
    ],
    optionGroups: [
      {
        id: "milk-type",
        label: "Milk type",
        type: "single",
        required: true,
        options: [
          { key: "full", label: "Full cream", default: true },
          { key: "almond", label: "Almond milk", priceDelta: 0.5 },
          { key: "oat", label: "Oat milk", priceDelta: 0.6 },
        ],
      },
    ],
  },
  {
    name: "Latte",
    ingredients: ["espresso", "steamed milk", "milk foam"],
    available: true,
    quantity: 45,
    price: 5.0,
    category: ["Drink"],
    image: "/menu_items/latte.png",
    baseIngredients: [
      { key: "espresso", label: "Espresso", default: true, removable: false },
      { key: "milk", label: "Steamed milk", default: true, removable: true },
      { key: "foam", label: "Milk foam", default: false, removable: true },
    ],
    optionGroups: [
      {
        id: "milk-type",
        label: "Milk type",
        type: "single",
        required: true,
        options: [
          { key: "full", label: "Full cream", default: true },
          { key: "almond", label: "Almond milk", priceDelta: 0.5 },
          { key: "oat", label: "Oat milk", priceDelta: 0.6 },
        ],
      },
    ],
  },
  {
    name: "Macchiato",
    ingredients: ["espresso", "milk foam"],
    available: false,
    quantity: 20,
    price: 4.0,
    category: ["Drink"],
    image: "/menu_items/macchiato.png",
    baseIngredients: [
      { key: "espresso", label: "Espresso", default: true, removable: false },
      { key: "foam", label: "Milk foam", default: true, removable: true },
    ],
    // no milk-type here because there's no steamed milk base key
  },
  {
    name: "Mocha",
    ingredients: ["espresso", "chocolate", "steamed milk", "milk foam"],
    available: true,
    quantity: 30,
    price: 5.5,
    category: ["Drink"],
    image: "/menu_items/mocha.png",
    baseIngredients: [
      { key: "espresso", label: "Espresso", default: true, removable: false },
      { key: "choc", label: "Chocolate", default: true, removable: true },
      { key: "milk", label: "Steamed milk", default: true, removable: true },
      { key: "foam", label: "Milk foam", default: false, removable: true },
    ],
    optionGroups: [
      {
        id: "milk-type",
        label: "Milk type",
        type: "single",
        required: true,
        options: [
          { key: "full", label: "Full cream", default: true },
          { key: "almond", label: "Almond milk", priceDelta: 0.5 },
          { key: "oat", label: "Oat milk", priceDelta: 0.6 },
        ],
      },
    ],
  },
];

export const mockMenuItems = async () => {
  const col = MenuItemsCollection.rawCollection();
  await col.createIndex({ name: 1 }, { unique: true }).catch(() => {});

  for (const raw of fixedMenuItems) {
    const now = new Date();
    const doc = { ...raw, updatedAt: now };
    await col.replaceOne({ name: raw.name }, doc, { upsert: true });
  }
};

export const fixedItemCategories = [
  { name: "Food" },
  { name: "Drink" },
  { name: "Dessert" },
];

export const mockItemCategories = async () => {
  if ((await ItemCategoriesCollection.countDocuments()) > 0) {
    await ItemCategoriesCollection.dropCollectionAsync();
  }

  for (const category of fixedItemCategories) {
    await ItemCategoriesCollection.insertAsync(category);
  }
};
