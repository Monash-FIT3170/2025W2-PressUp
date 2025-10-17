import { faker } from "@faker-js/faker";
import { fixedMenuItems } from "../menuItems/mock";
import { SuppliersCollection } from "../suppliers/SuppliersCollection";
import { StockItemsCollection } from "./StockItemsCollection";

const generateExpiryDate = (): Date | null => {
  // 30% chance of no expiry date
  if (faker.datatype.boolean(0.3)) {
    return null;
  }
  // Generate date between 1 month ago and 1 month in the future
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

  return faker.date.between({ from: oneMonthAgo, to: oneMonthFromNow });
};

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
    // Randomly choose how many entries to create for this ingredient
    const count = faker.helpers.arrayElement([5, 30, 100]);

    // Create multiple entries for each ingredient
    for (let i = 0; i < count; i++) {
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
        quantity: faker.number.int({ min: 1, max: 25 }), // Smaller quantities per item since we have multiple
        location: faker.location.secondaryAddress(),
        supplier, // string | null (required by schema)
        expiryDate: generateExpiryDate(),
      });
    }
  }
};
