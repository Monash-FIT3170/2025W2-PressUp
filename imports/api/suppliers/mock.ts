import { faker } from "@faker-js/faker";
import { SuppliersCollection } from "./SuppliersCollection";

export const mockSuppliers = async (count: number) => {
  if ((await SuppliersCollection.countDocuments()) > 0) {
    await SuppliersCollection.dropCollectionAsync();
  }

  for (let i = 0; i < count; ++i) {
    await SuppliersCollection.insertAsync({
      name: faker.company.name(),
      phone: faker.phone.number(),
      email: faker.internet.email(),
      address: faker.location.streetAddress(),
    });
  }
};
