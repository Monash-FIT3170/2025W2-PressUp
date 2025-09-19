import { faker } from "@faker-js/faker";
import { StockItemsCollection } from "../stockItems/StockItemsCollection";
import {
  PurchaseOrdersCollection,
  StockItemLine,
} from "./PurchaseOrdersCollection";
import { Supplier } from "../suppliers/SuppliersCollection";

export const mockPurchaseOrders = async (count: number) => {
  if ((await PurchaseOrdersCollection.countDocuments()) > 0) {
    await PurchaseOrdersCollection.dropCollectionAsync();
  }

  // Get all suppliers that have associated stock items
  const validSuppliers = (await StockItemsCollection.rawCollection()
    .aggregate([
      { $match: { supplier: { $ne: null } } },
      { $group: { _id: "$supplier" } },
      { $project: { _id: 1 } },
    ])
    .toArray()) as Supplier[];

  if (validSuppliers.length === 0) {
    console.warn(
      "No suppliers with stock items found. Cannot create any mock purchase orders.",
    );
    return;
  }

  for (let i = 0; i < count; ++i) {
    const randomSupplier = faker.helpers.arrayElement(validSuppliers);

    const supplierStockItems = await StockItemsCollection.find({
      supplier: randomSupplier._id,
    }).fetchAsync();

    const numLines = faker.number.int({ min: 1, max: 3 });
    const shuffledItems = faker.helpers.shuffle(supplierStockItems);
    const selectedItems = shuffledItems.slice(
      0,
      Math.min(numLines, supplierStockItems.length),
    );

    const stockItemLines: StockItemLine[] = [];
    for (const stockItem of selectedItems) {
      stockItemLines.push({
        stockItem: stockItem._id,
        quantity: faker.number.int({ min: 1, max: 20 }),
        cost: faker.number.float({ min: 5, max: 100, fractionDigits: 2 }),
      });
    }

    const calculatedTotalCost = stockItemLines.reduce(
      (total, line) => total + line.cost * line.quantity,
      0,
    );

    await PurchaseOrdersCollection.insertAsync({
      supplier: randomSupplier._id,
      number: faker.number.int({ min: 1, max: 15 }),
      stockItems: stockItemLines,
      totalCost: calculatedTotalCost,
      date: new Date(),
    });
  }
};
