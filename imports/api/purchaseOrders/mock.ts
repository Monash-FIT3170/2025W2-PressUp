import { faker } from "@faker-js/faker";
import { SuppliersCollection } from "../suppliers/SuppliersCollection";
import { PurchaseOrdersCollection } from "./PurchaseOrdersCollection";

export const mockPurchaseOrders = async (count: number) => {
  if ((await PurchaseOrdersCollection.countDocuments()) > 0) {
    await PurchaseOrdersCollection.dropCollectionAsync();
  }

  for (let i = 0; i < count; ++i) {
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
};
