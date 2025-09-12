import { faker } from "@faker-js/faker";
import { DeductionsCollection } from "./DeductionsCollection";

export const mockDeductions = async (count: number = 8) => {
  if ((await DeductionsCollection.countDocuments()) > 0) {
    await DeductionsCollection.dropCollectionAsync();
  }

  const deductionTypes = [
    { name: "Office Supplies", minAmount: 20, maxAmount: 200 },
    { name: "Equipment Maintenance", minAmount: 100, maxAmount: 800 },
    { name: "Utilities", minAmount: 150, maxAmount: 500 },
    { name: "Insurance", minAmount: 200, maxAmount: 1000 },
    { name: "Professional Services", minAmount: 300, maxAmount: 1500 },
    { name: "Marketing & Advertising", minAmount: 50, maxAmount: 600 },
    { name: "Staff Training", minAmount: 100, maxAmount: 400 },
    { name: "Software Licenses", minAmount: 50, maxAmount: 300 },
    { name: "Travel Expenses", minAmount: 80, maxAmount: 350 },
    { name: "Business Meals", minAmount: 30, maxAmount: 150 },
  ];

  for (let i = 0; i < count; i++) {
    const deductionType = faker.helpers.arrayElement(deductionTypes);
    const amount = faker.number.float({
      min: deductionType.minAmount,
      max: deductionType.maxAmount,
      fractionDigits: 2,
    });

    await DeductionsCollection.insertAsync({
      name: deductionType.name,
      date: faker.date.recent({ days: 90 }),
      description: faker.lorem.sentence({ min: 4, max: 12 }),
      amount: amount,
    });
  }
};
