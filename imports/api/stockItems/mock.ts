import { faker } from "@faker-js/faker";
import { fixedMenuItems } from "../menuItems/mock";
import { SuppliersCollection } from "../suppliers/SuppliersCollection";
import { StockItemsCollection } from "./StockItemsCollection";

export const mockStockItems = async () => {
  if ((await StockItemsCollection.countDocuments()) > 0) {
    await StockItemsCollection.dropCollectionAsync();
  }

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
};
