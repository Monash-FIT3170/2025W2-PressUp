import { faker } from "@faker-js/faker";
import { MenuItemsCollection } from "../menuItems/MenuItemsCollection";
import { TablesCollection } from "../tables/TablesCollection";
import {
  OrderMenuItem,
  OrdersCollection,
  OrderStatus,
} from "./OrdersCollection";

export const mockOrders = async (count: number) => {
  if ((await OrdersCollection.countDocuments()) > 0) {
    await OrdersCollection.dropCollectionAsync();
  }

  // Create orders: mix of dine-in (linked to tables) and takeaway (no table)
  // Only select tables that are occupied
  const allOccupiedTables = await TablesCollection.find(
    { isOccupied: true },
    { fields: { tableNo: 1 } },
  ).fetchAsync();
  const availableTableNos = allOccupiedTables.map((t) => t.tableNo);

  const dineInCount = Math.max(0, Math.min(count, availableTableNos.length));
  const takeawayCount = Math.max(0, count! - dineInCount);

  // Start orderNo from 1001
  let nextOrderNo = 1001;

  const genOrderMenuItems = async (): Promise<OrderMenuItem[]> => {
    const rawMenuItems = await MenuItemsCollection.rawCollection()
      .aggregate([{ $sample: { size: faker.number.int({ min: 0, max: 3 }) } }])
      .toArray();

    return rawMenuItems.map((item) => ({
      _id: faker.string.alpha(10),
      name: item.name,
      quantity: faker.number.int({ min: 1, max: 3 }),
      ingredients: item.ingredients ?? [],
      available: item.available ?? true,
      price: item.price ?? 0,
      category: item.category ?? [],
      image: item.image ?? "",
    }));
  };

  const decideStatus = (items: OrderMenuItem[]): OrderStatus => {
    if (items.length === 0) return OrderStatus.Pending;
    return faker.datatype.boolean(0.5)
      ? OrderStatus.Preparing
      : faker.datatype.boolean(0.3)
        ? OrderStatus.Ready
        : OrderStatus.Pending;
  };

  const shuffledTableNos = faker.helpers
    .shuffle(availableTableNos)
    .slice(0, dineInCount);
  for (const tableNo of shuffledTableNos) {
    const items = await genOrderMenuItems();
    const status = decideStatus(items);
    const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

    const orderID = await OrdersCollection.insertAsync({
      orderNo: nextOrderNo,
      orderType: "dine-in",
      tableNo,
      menuItems: items,
      totalPrice: total,
      paid: false,
      orderStatus: status,
      createdAt: new Date(
        Date.now() - faker.number.int({ min: 0, max: 25 * 60 }) * 1000,
      ),
    });
    nextOrderNo++;

    // Update the table with activeOrderID and push to orderIDs
    await TablesCollection.updateAsync(
      { tableNo },
      {
        $set: { activeOrderID: String(orderID) },
        $push: { orderIDs: String(orderID) },
      },
    );
  }

  for (let i = 0; i < takeawayCount; i++) {
    const items = await genOrderMenuItems();
    const status = decideStatus(items);
    const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

    await OrdersCollection.insertAsync({
      orderNo: nextOrderNo,
      orderType: "takeaway",
      tableNo: null,
      menuItems: items,
      totalPrice: total,
      paid: false,
      orderStatus: status,
      createdAt: faker.date.recent({ days: 7 }),
    });
    nextOrderNo++;
  }
};
