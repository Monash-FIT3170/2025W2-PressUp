import { faker } from "@faker-js/faker";
import { fixedMenuItems } from "../menuItems/mock";
import { SuppliersCollection } from "../suppliers/SuppliersCollection";
import { StockItemsCollection } from "./StockItemsCollection";
import { insertStockItem } from "./helpers";

const generateExpiry = (): Date | null => {
  if (faker.datatype.boolean(0.3)) {
    return null;
  }
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
  const allIngredients: string[] = Array.from(
    new Set(fixedMenuItems.flatMap((item) => item.ingredients ?? [])),
  ).filter((x): x is string => typeof x === "string" && x.trim().length > 0);

  const allSuppliers = await SuppliersCollection.find({}).fetchAsync();

  for (const ingredient of allIngredients) {
    const supplierVariations = faker.number.int({ min: 1, max: 3 });

    for (let v = 0; v < supplierVariations; v++) {
      const hasSupplier =
        allSuppliers.length > 0 && faker.datatype.boolean(0.8);
      const supplier = hasSupplier
        ? faker.helpers.arrayElement(allSuppliers)._id
        : null;

      const lineItemCount = faker.helpers.arrayElement([5, 15, 30]);

      // Use the shared insert function to handle deduplication
      for (let i = 0; i < lineItemCount; i++) {
        await insertStockItem({
          name: ingredient,
          supplier: supplier,
          quantity: faker.number.int({ min: 1, max: 25 }),
          location: faker.location.secondaryAddress(),
          expiry: generateExpiry(),
        });
      }
    }
  }
};
