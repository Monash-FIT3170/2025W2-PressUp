import { faker } from "@faker-js/faker";
import { fixedMenuItems } from "../menuItems/mock";
import { SuppliersCollection } from "../suppliers/SuppliersCollection";
import { StockItemsCollection } from "./StockItemsCollection";

export const mockStockItems = async () => {
  if ((await StockItemsCollection.countDocuments()) > 0) {
    await StockItemsCollection.dropCollectionAsync();
  }

  // Gather all unique ingredients from fixedMenuItems
  // Make sure we only collect strings (no undefined)
  const allIngredients: string[] = Array.from(
    new Set(fixedMenuItems.flatMap((item) => item.ingredients ?? [])),
  ).filter((x): x is string => typeof x === "string" && x.trim().length > 0);

  for (const ingredient of allIngredients) {
    const sampled = await SuppliersCollection.rawCollection()
      .aggregate([{ $sample: { size: 1 } }, { $project: { _id: 1 } }])
      .toArray();

    // Convert to string, but if missing use null (NOT undefined)
    const sampledId: string | null = sampled[0]?._id
      ? String(sampled[0]._id)
      : null;

    // 75% chance to attach supplier if we have one; otherwise null
    const supplier: string | null =
      faker.datatype.boolean(0.75) && sampledId ? sampledId : null;

    await StockItemsCollection.insertAsync({
      name: ingredient, // string
      quantity: faker.number.int({ min: 0, max: 50 }),
      location: faker.location.secondaryAddress(),
      supplier, // string | null (required by schema)
    });
  }
};
