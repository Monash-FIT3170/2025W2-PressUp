import { faker } from "@faker-js/faker";
import { TablesCollection } from "./TablesCollection";

export const mockTables = async (count: number) => {
  if ((await TablesCollection.countDocuments()) > 0) {
    await TablesCollection.dropCollectionAsync();
  }

  // Create tables first with no order assigned
  for (let i = 1; i < count + 1; ++i) {
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
};
