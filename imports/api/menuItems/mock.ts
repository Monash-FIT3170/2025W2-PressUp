import { MenuItemsCollection } from "./MenuItemsCollection";

export const fixedMenuItems = [
  {
    name: "Beef Burger",
    ingredients: ["bun", "lettuce", "cheese", "tomato", "beef patty", "onion"],
    available: true,
    quantity: 20,
    price: 9.0,
    category: ["Food"],
    image: "/menu_items/beef burger.png",

    // New structure (options)
    baseIngredients: [
      { key: "bun", label: "Bun", default: true, removable: false },
      { key: "patty", label: "Beef Patty", default: true, removable: false },
      { key: "onion", label: "Onion", default: true, removable: true },
      { key: "cheese", label: "Cheese", default: true, removable: true },
    ],
    optionGroups: [
      {
        id: "doneness",
        label: "Patty Doneness",
        type: "single" as "single", // Explicitly define the type
        options: [
          { key: "m", label: "Medium", default: true },
          { key: "mw", label: "Medium Well" },
        ],
      },
    ],
  },
  {
    name: "Cappuccino",
    ingredients: ["espresso", "steamed milk", "milk foam"],
    available: true,
    quantity: 50,
    price: 5.0,
    category: ["Drink"],
    image: "/menu_items/cappuccino.png",

    // New structure (options)
    baseIngredients: [
      { key: "espresso", label: "Espresso", default: true, removable: false },
      { key: "foam", label: "Milk Foam", default: true, removable: true },
    ],
    optionGroups: [
      {
        id: "milk",
        label: "Milk",
        type: "single" as "single", // Explicitly define the type
        required: true,
        options: [
          { key: "whole", label: "Whole Milk", default: true },
          { key: "almond", label: "Almond Milk", priceDelta: 0.5 },
          { key: "oat", label: "Oat Milk", priceDelta: 0.7 },
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
  },
  {
    name: "Croissant",
    ingredients: ["flour", "butter", "yeast", "milk"],
    available: false,
    quantity: 30,
    price: 4.5,
    category: ["Food"],
    image: "/menu_items/croissant.png",
  },
  {
    name: "Flat White",
    ingredients: ["espresso", "steamed milk"],
    available: true,
    quantity: 35,
    price: 5.0,
    category: ["Drink"],
    image: "/menu_items/flat white.png",
  },
  {
    name: "Iced Latte",
    ingredients: ["espresso", "milk", "ice"],
    available: true,
    quantity: 25,
    price: 5.5,
    category: ["Drink"],
    image: "/menu_items/iced latte.png",
  },
  {
    name: "Latte",
    ingredients: ["espresso", "steamed milk", "milk foam"],
    available: true,
    quantity: 45,
    price: 5.0,
    category: ["Drink"],
    image: "/menu_items/latte.png",
  },
  {
    name: "Macchiato",
    ingredients: ["espresso", "milk foam"],
    available: false,
    quantity: 20,
    price: 4.0,
    category: ["Drink"],
    image: "/menu_items/macchiato.png",
  },
  {
    name: "Mocha",
    ingredients: ["espresso", "chocolate", "steamed milk", "milk foam"],
    available: true,
    quantity: 30,
    price: 5.5,
    category: ["Drink"],
    image: "/menu_items/mocha.png",
  },
  {
    name: "Muffin",
    ingredients: ["flour", "sugar", "blueberries", "butter"],
    available: true,
    quantity: 30,
    price: 3.5,
    category: ["Food"],
    image: "/menu_items/muffin.png",
  },
];

export const mockMenuItems = async () => {
  // Use upsert instead of drop to safely update or insert items
  for (const raw of fixedMenuItems) {
    const now = new Date();
    await MenuItemsCollection.upsertAsync(
      { name: raw.name }, // Unique key
      {
        $set: { ...raw, updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
    );
  }
};
