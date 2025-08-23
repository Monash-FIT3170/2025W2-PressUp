import { MenuItemsCollection } from "./menuItems/MenuItemsCollection";
import { StockItemsCollection } from "./stockItems/StockItemsCollection";
import { SuppliersCollection } from "./suppliers/SuppliersCollection";
import { faker } from "@faker-js/faker";
import { PurchaseOrdersCollection } from "./purchaseOrders/PurchaseOrdersCollection";
import { OrderMenuItem, OrdersCollection, OrderStatus } from "./orders/OrdersCollection";
import { TablesCollection } from "./tables/TablesCollection";
import { Mongo } from "meteor/mongo";

export const possibleImages = [
  "/menu_items/cappuccino.png",
  "/menu_items/cookie.png",
  "/menu_items/croissant.png",
  "/menu_items/flat white.png",
  "/menu_items/iced latte.png",
  "/menu_items/latte.png",
  "/menu_items/macchiato.png",
  "/menu_items/mocha.png",
  "/menu_items/muffin.png",
  "menu_items/beef burger.png",
];

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

export const mockDataGenerator = async ({
  supplierCount,
  menuItemCount,
  stockItemCount,
  orderCount,
  purchaseOrderCount,
  tableCount,
}: {
  supplierCount?: number;
  menuItemCount?: number;
  stockItemCount?: number;
  orderCount?: number;
  purchaseOrderCount?: number;
  tableCount?: number;
}) => {
  supplierCount = supplierCount || 10;
  menuItemCount = menuItemCount || 20;
  stockItemCount = stockItemCount || 50;
  orderCount = orderCount || 5;
  purchaseOrderCount = purchaseOrderCount || 10;
  tableCount = tableCount || 10;

  if (await SuppliersCollection.countDocuments() > 0) {
    await SuppliersCollection.dropCollectionAsync();
  }
  if (await MenuItemsCollection.countDocuments() > 0) {
    await MenuItemsCollection.dropCollectionAsync();
  }
  if (await StockItemsCollection.countDocuments() > 0) {
    await StockItemsCollection.dropCollectionAsync();
  }
  if (await TablesCollection.countDocuments() > 0) {
    await TablesCollection.dropCollectionAsync();
  }
  if (await OrdersCollection.countDocuments() > 0) {
    await OrdersCollection.dropCollectionAsync();
  }

  if ((await SuppliersCollection.countDocuments()) === 0) {
    for (let i = 0; i < supplierCount; ++i) {
      await SuppliersCollection.insertAsync({
        name: faker.company.name(),
        description: faker.lorem.paragraph(),
        pastOrderQty: faker.number.int({ min: 5, max: 100 }),
        phone: faker.phone.number(),
        email: faker.internet.email(),
        address: faker.location.streetAddress(),
        goods: Array.from(
          { length: faker.number.int({ min: 1, max: 5 }) },
          faker.commerce.product
        ),
      });
    }
  }

  if ((await MenuItemsCollection.countDocuments()) === 0) {
    for (const item of fixedMenuItems) {
      await MenuItemsCollection.insertAsync(item);
    }
  }

  if ((await StockItemsCollection.countDocuments()) === 0) {
    // Gather all unique ingredients from fixedMenuItems
    const allIngredients = Array.from(
      new Set(fixedMenuItems.flatMap(item => item.ingredients))
    );
    for (const ingredient of allIngredients) {
      const randomSupplier = (
        await SuppliersCollection.rawCollection()
          .aggregate([{ $sample: { size: 1 } }, { $project: { _id: 1 } }])
          .toArray()
      )[0];

      const randomSupplierId = faker.datatype.boolean(0.75)
        ? randomSupplier && randomSupplier._id
          ? randomSupplier._id
          : null
        : null;

      await StockItemsCollection.insertAsync({
        name: ingredient,
        quantity: faker.number.int({ min: 0, max: 50 }),
        location: faker.location.secondaryAddress(),
        supplier: randomSupplierId,
      });
    }
  }

  if ((await PurchaseOrdersCollection.countDocuments()) === 0) {
    for (let i = 0; i < purchaseOrderCount; ++i) {
      const randomSupplier = (
        await SuppliersCollection.rawCollection()
          .aggregate([{ $sample: { size: 1 } }, { $project: { _id: 1 } }])
          .toArray()
      )[0];

      const randomSupplierId = faker.datatype.boolean(0.75)
        ? randomSupplier
          ? randomSupplier._id
            ? randomSupplier._id
            : null
          : null
        : null;

      await PurchaseOrdersCollection.insertAsync({
        supplier: randomSupplierId,
        number: faker.number.int({ min: 1, max: 15 }),
        stockItems: [],
        totalCost: faker.number.int({ min: 1, max: 300 }),
        date: new Date(),
      });
    }
  }

  // Create tables first with no order assigned
  if ((await TablesCollection.countDocuments()) === 0) {
    for (let i = 1; i < tableCount + 1; ++i) {
      let capacity = faker.number.int({ min: 1, max: 10 });
      // Set 70% occupied, and 30% not occupied
      let isOccupied = faker.datatype.boolean(0.7) ? true : false;
      // If occupied, set number of occupants from 1 to max capacity of table, otherwise, zero occupants
      let noOccupants = isOccupied ? faker.number.int({ min: 1, max: capacity }) : 0;

      await TablesCollection.insertAsync({
        tableNo: i,
        orderID: null,
        capacity: capacity,
        isOccupied: isOccupied,
        noOccupants: noOccupants,
      });
    }
  }

  // Create orders and assign to tableNos
  if ((await OrdersCollection.countDocuments()) === 0) {
    // Fetch all existing table numbers
    const allTables = await TablesCollection.find({}, { fields: { tableNo: 1 } }).fetchAsync();
    const availableTableNos = allTables.map((t) => t.tableNo);

    // Shuffle table numbers and get up to orderCount amount
    const shuffledTableNos = faker.helpers.shuffle(availableTableNos).slice(0, orderCount);

    // Create orders using these table numbers
    for (let i = 0; i < shuffledTableNos.length; ++i) {
      const tableNo = shuffledTableNos[i];

      const rawMenuItems = await MenuItemsCollection.rawCollection()
        .aggregate([{ $sample: { size: faker.number.int({ min: 0, max: 3 }) } }])
        .toArray();

      const orderMenuItems: OrderMenuItem[] = rawMenuItems.map((item: any) => ({
        _id: new Mongo.ObjectID(),
        name: item.name,
        quantity: faker.number.int({ min: 1, max: 3 }),
        ingredients: item.ingredients ?? [],
        available: item.available ?? true,
        price: item.price ?? 0,
        category: item.category ?? [],
        image: item.image ?? "",
      }));

      // Set orderStatus Pending if no items, otherwise 50% chance Preparing, 30% Ready and 20% Pending
      let orderStatus: OrderStatus;
      if (orderMenuItems.length === 0) {
        orderStatus = OrderStatus.Pending;
      } else {
        orderStatus = faker.datatype.boolean(0.5)
          ? OrderStatus.Preparing
          : faker.datatype.boolean(0.3)
          ? OrderStatus.Ready
          : OrderStatus.Pending;
      }

      // Insert order and get its ID
      const orderID = await OrdersCollection.insertAsync({
        orderNo: faker.number.int({ min: 1000, max: 9999 }),
        tableNo: tableNo,
        menuItems: orderMenuItems,
        totalPrice: orderMenuItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
        paid: false,
        orderStatus,
        createdAt: faker.date.recent({ days: 7 }),
      });

      // Update the table to reference this order ID
      await TablesCollection.updateAsync(
        { tableNo },
        { $set: { orderID: String(orderID) } }
      );
    }
  }
};
