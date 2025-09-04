import { MenuItemsCollection } from "./menuItems/MenuItemsCollection";
import { StockItemsCollection } from "./stockItems/StockItemsCollection";
import { SuppliersCollection } from "./suppliers/SuppliersCollection";
import { faker } from "@faker-js/faker";
import { PurchaseOrdersCollection } from "./purchaseOrders/PurchaseOrdersCollection";
import {
  OrderMenuItem,
  OrdersCollection,
  OrderStatus,
} from "./orders/OrdersCollection";
import { TablesCollection } from "./tables/TablesCollection";

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
  // menuItemCount = menuItemCount || 20;
  // stockItemCount = stockItemCount || 50;
  orderCount = orderCount || 5;
  purchaseOrderCount = purchaseOrderCount || 10;
  tableCount = tableCount || 10;

  if ((await SuppliersCollection.countDocuments()) > 0) {
    await SuppliersCollection.dropCollectionAsync();
  }
  if ((await MenuItemsCollection.countDocuments()) > 0) {
    await MenuItemsCollection.dropCollectionAsync();
  }
  if ((await StockItemsCollection.countDocuments()) > 0) {
    await StockItemsCollection.dropCollectionAsync();
  }
  if ((await TablesCollection.countDocuments()) > 0) {
    await TablesCollection.dropCollectionAsync();
  }
  if ((await OrdersCollection.countDocuments()) > 0) {
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
      new Set(fixedMenuItems.flatMap((item) => item.ingredients)),
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
      // const capacity = faker.number.int({ min: 1, max: 6 });
      // // Set 70% occupied, and 30% not occupied
      // const isOccupied = faker.datatype.boolean(0.7) ? true : false;
      // // If occupied, set number of occupants from 1 to max capacity of table, otherwise, zero occupants
      // const noOccupants = isOccupied
      //   ? faker.number.int({ min: 1, max: capacity })
      //   : 0;
      const capacity = faker.number.int({ min: 1, max: 6 });
      // Set every even table to be occupied
      const isOccupied = i % 2 == 0 ? true : false;
      // If occupied, set number of occupants from 1 to max capacity of table, otherwise, zero occupants
      const noOccupants = isOccupied
        ? faker.number.int({ min: 1, max: capacity })
        : 0;

      await TablesCollection.insertAsync({
        tableNo: i,
        activeOrderID: null,
        orderIDs: [],
        capacity: capacity,
        isOccupied: isOccupied,
        noOccupants: noOccupants,
      });
    }
  }

  // Create orders: mix of dine-in (linked to tables) and takeaway (no table)
  if ((await OrdersCollection.countDocuments()) === 0) {
    // Only select tables that are occupied
    const allOccupiedTables = await TablesCollection.find(
      { isOccupied: true },
      { fields: { tableNo: 1 } },
    ).fetchAsync();
    const availableTableNos = allOccupiedTables.map((t) => t.tableNo);

    const dineInCount = Math.max(
      0,
      Math.min(orderCount!, availableTableNos.length),
    );
    const takeawayCount = Math.max(0, orderCount! - dineInCount);

    // Start orderNo from 1001
    let nextOrderNo = 1001;

    const genOrderMenuItems = async (): Promise<OrderMenuItem[]> => {
      const rawMenuItems = await MenuItemsCollection.rawCollection()
        .aggregate([
          { $sample: { size: faker.number.int({ min: 0, max: 3 }) } },
        ])
        .toArray();

      return rawMenuItems.map((item: any) => ({
        _id: faker.string.alpha(10),
        name: item.name,
        quantity: faker.number.int({ min: 1, max: 3 }),
        ingredients: item.ingredients ?? [],
        available: item.available ?? true,
        price: item.price ?? 0,
        category: item.category ?? [],
        image: item.image ?? "",
      }));
    };

    const decideStatus = (items: OrderMenuItem[]): OrderStatus => {
      if (items.length === 0) return OrderStatus.Pending;
      return faker.datatype.boolean(0.5)
        ? OrderStatus.Preparing
        : faker.datatype.boolean(0.3)
          ? OrderStatus.Ready
          : OrderStatus.Pending;
    };

    const shuffledTableNos = faker.helpers
      .shuffle(availableTableNos)
      .slice(0, dineInCount);
    for (const tableNo of shuffledTableNos) {
      const items = await genOrderMenuItems();
      const status = decideStatus(items);
      const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

      const orderID = await OrdersCollection.insertAsync({
        orderNo: nextOrderNo,
        orderType: "dine-in",
        tableNo,
        menuItems: items,
        totalPrice: total,
        paid: false,
        orderStatus: status,
        createdAt: new Date(
          Date.now() - faker.number.int({ min: 0, max: 25 * 60 }) * 1000,
        ),
      });
      nextOrderNo++;

      // Update the table with activeOrderID and push to orderIDs
      await TablesCollection.updateAsync(
        { tableNo },
        {
          $set: { activeOrderID: String(orderID) },
          $push: { orderIDs: String(orderID) },
        },
      );
    }

    for (let i = 0; i < takeawayCount; i++) {
      const items = await genOrderMenuItems();
      const status = decideStatus(items);
      const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

      await OrdersCollection.insertAsync({
        orderNo: nextOrderNo,
        orderType: "takeaway",
        tableNo: null,
        menuItems: items,
        totalPrice: total,
        paid: false,
        orderStatus: status,
        createdAt: faker.date.recent({ days: 7 }),
      });
      nextOrderNo++;
    }
  }
};
