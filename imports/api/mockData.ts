import { MenuItemsCollection } from "./menuItems/MenuItemsCollection";
import { StockItemsCollection } from "./stockItems/StockItemsCollection";
import { SuppliersCollection } from "./suppliers/SuppliersCollection";
import { faker } from "@faker-js/faker";
import { TransactionsCollection } from "./transactions/TransactionsCollection";
import { OrdersCollection, OrderStatus } from "./orders/OrdersCollection";
import { PurchaseOrdersCollection } from "./purchaseOrders/PurchaseOrdersCollection";

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
];

export const mockDataGenerator = async ({
  supplierCount,
  menuItemCount,
  stockItemCount,
  transactionCount,
  orderCount,
  purchaseOrderCount
}: {
  supplierCount?: number;
  menuItemCount?: number;
  stockItemCount?: number;
  transactionCount?: number;
  orderCount?: number;
  purchaseOrderCount?: number;
}) => {
  supplierCount = supplierCount || 10;
  menuItemCount = menuItemCount || 20;
  stockItemCount = stockItemCount || 50;
  transactionCount = transactionCount || 5;
  orderCount = orderCount || 5;
  purchaseOrderCount = purchaseOrderCount || 10;

  if (await SuppliersCollection.countDocuments() > 0) await SuppliersCollection.dropCollectionAsync();
  if (await MenuItemsCollection.countDocuments() > 0) await MenuItemsCollection.dropCollectionAsync();
  if (await StockItemsCollection.countDocuments() > 0) await StockItemsCollection.dropCollectionAsync();
  if (await TransactionsCollection.countDocuments() > 0) await TransactionsCollection.dropCollectionAsync();
  if (await OrdersCollection.countDocuments() > 0) await OrdersCollection.dropCollectionAsync();

  if ((await SuppliersCollection.countDocuments()) == 0)
    for (let i = 0; i < supplierCount; ++i)
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

  if ((await MenuItemsCollection.countDocuments()) == 0)
    for (let i = 0; i < menuItemCount; ++i)
      await MenuItemsCollection.insertAsync({
        name: faker.food.dish(),
        ingredients: Array.from(
          { length: faker.number.int({ min: 1, max: 5 }) },
          faker.food.ingredient
        ),
        available: faker.datatype.boolean(),
        quantity: faker.number.int({ min: 1, max: 100 }),
        price: faker.number.float({ min: 1, max: 100 }),
        category: [faker.datatype.boolean() ? "Food" : "Drink"],
        image:
          possibleImages[
            faker.number.int({ min: 0, max: possibleImages.length - 1 })
          ],
      });

  if ((await StockItemsCollection.countDocuments()) == 0)
    for (let i = 0; i < stockItemCount; ++i) {
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

      await StockItemsCollection.insertAsync({
        name: faker.commerce.product(),
        quantity: faker.datatype.boolean({ probability: 0.8 })
          ? faker.number.int({ min: 1, max: 300 })
          : 0,
        location: faker.location.secondaryAddress(),
        supplier: randomSupplierId,
      });
    }

  if ((await TransactionsCollection.countDocuments()) == 0)
    for (let i = 0; i < transactionCount; ++i)
      await TransactionsCollection.insertAsync({
        name: faker.food.dish(),
        quantity: faker.number.int({ min: 1, max: 5 }),
        price: faker.number.int({ min: 1, max: 20 }),
        createdAt: new Date(),
      });

  if ((await PurchaseOrdersCollection.countDocuments()) == 0)
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

    if ((await OrdersCollection.countDocuments()) == 0) {
      const usedTableNumbers = new Set<number>();
      for (let i = 0; i < orderCount; ++i) {
        let tableNo;
        // Ensure unique table numbers
        do {
          tableNo = i+1;
        } while (usedTableNumbers.has(tableNo));
        usedTableNumbers.add(tableNo);

        await OrdersCollection.insertAsync({
          orderNo: faker.number.int({ min: 1000, max: 9999 }),
          tableNo,
          menuItems: [],
          totalPrice: faker.number.float({ min: 3, max: 300}),
          paid: false,
          orderStatus: faker.helpers.arrayElement(Object.values(OrderStatus)) as OrderStatus,
          createdAt: faker.date.recent({ days: 7 }),
        });
      }
    }
};
