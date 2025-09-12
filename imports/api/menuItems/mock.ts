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
  },
  {
    name: "Cappuccino",
    ingredients: ["espresso", "steamed milk", "milk foam"],
    available: true,
    quantity: 50,
    price: 5.0,
    category: ["Drink"],
    image: "/menu_items/cappuccino.png",
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
  if ((await MenuItemsCollection.countDocuments()) > 0) {
    await MenuItemsCollection.dropCollectionAsync();
  }

  for (const item of fixedMenuItems) {
    await MenuItemsCollection.insertAsync(item);
  }
};
