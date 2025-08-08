import { MenuItemsCollection } from "./menuItems/MenuItemsCollection";
import { StockItemsCollection } from "./stockItems/StockItemsCollection";
import { SuppliersCollection } from "./suppliers/SuppliersCollection";
import { faker } from "@faker-js/faker";
import { OrderMenuItem, OrdersCollection, OrderStatus } from "./orders/OrdersCollection";
import { TablesCollection } from "./tables/TablesCollection";

export const possibleImages = [
  "/menu_items/cappuccino.png",
  "/menu_items/cookie.png",
  "/menu_items/croissant.png",
  "/menu_items/flat white.png",
  "/menu_items/iced latte.png",
  "/menu_items/latte.png",
  "/menu_items/macchiato.png",
  "/menu_items/mocha.png",
  "/menu_items/muffin.png",
];

export const mockDataGenerator = async ({
  supplierCount,
  menuItemCount,
  stockItemCount,
  orderCount,
  tableCount,
}: {
  supplierCount?: number;
  menuItemCount?: number;
  stockItemCount?: number;
  orderCount?: number;
  tableCount?: number;
}) => {
  supplierCount = supplierCount || 10;
  menuItemCount = menuItemCount || 20;
  stockItemCount = stockItemCount || 50;
  orderCount = orderCount || 5;
  tableCount = tableCount || 20;

  if (await SuppliersCollection.countDocuments() > 0) await SuppliersCollection.dropCollectionAsync();
  if (await MenuItemsCollection.countDocuments() > 0) await MenuItemsCollection.dropCollectionAsync();
  if (await StockItemsCollection.countDocuments() > 0) await StockItemsCollection.dropCollectionAsync();
  if (await TablesCollection.countDocuments() > 0) await TablesCollection.dropCollectionAsync();
  if (await OrdersCollection.countDocuments() > 0) await OrdersCollection.dropCollectionAsync();

  if ((await SuppliersCollection.countDocuments()) == 0)
    for (let i = 0; i < supplierCount; ++i)
      await SuppliersCollection.insertAsync({
        name: faker.company.name(),
        description: faker.lorem.paragraph(),
        pastOrderQty: faker.number.int({ min: 5, max: 100 }),
        phone: faker.phone.number(),
        email: faker.internet.email(),
        address: faker.location.streetAddress(),
        goods: Array.from(
          { length: faker.number.int({ min: 1, max: 5 }) },
          faker.commerce.product
        ),
      });

  if ((await MenuItemsCollection.countDocuments()) == 0)
    for (let i = 0; i < menuItemCount; ++i)
      await MenuItemsCollection.insertAsync({
        name: faker.food.dish(),
        ingredients: Array.from(
          { length: faker.number.int({ min: 1, max: 5 }) },
          faker.food.ingredient
        ),
        available: faker.datatype.boolean(),
        quantity: faker.number.int({ min: 1, max: 100 }),
        price: faker.number.float({ min: 1, max: 100 }),
        category: [faker.datatype.boolean() ? "Food" : "Drink"],
        image:
          possibleImages[
            faker.number.int({ min: 0, max: possibleImages.length - 1 })
          ],
      });

  if ((await StockItemsCollection.countDocuments()) == 0)
    for (let i = 0; i < stockItemCount; ++i) {
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

      await StockItemsCollection.insertAsync({
        name: faker.commerce.product(),
        quantity: faker.datatype.boolean({ probability: 0.8 })
          ? faker.number.int({ min: 1, max: 300 })
          : 0,
        location: faker.location.secondaryAddress(),
        supplier: randomSupplierId,
      });
    }
    
    if ((await TablesCollection.countDocuments()) == 0) {
      const usedOrderNos = new Set<number>(); // Track used orderNo values

      for (let i = 1; i < tableCount+1; ++i) {
        let capacity = faker.number.int({ min: 1, max: 20 })
        let noOccupants = faker.number.int({ min: 0, max: capacity}) // number of occupants can be 0 to max capacity of table
        let isOccupied = noOccupants > 0 ? true : false // if table has occupants, set isOccupied to true, otherwise false

        let randomOrderNo = null;
        let randomOrder = null;

        if (isOccupied) {
          // Get a random unused order
          const remainingOrders = await OrdersCollection.find({ orderNo: { $nin: Array.from(usedOrderNos) }, }).fetch();
          
          if ( remainingOrders.length > 0 &&
              faker.datatype.boolean(0.8) // 80% chance of assigning an order if table is occupied
          ) {
              randomOrder = faker.helpers.arrayElement(remainingOrders);
              randomOrderNo = randomOrder.orderNo;
              usedOrderNos.add(randomOrderNo); // Mark order as used
            }
          };

        await TablesCollection.insertAsync({
          tableNo: i,
          order: randomOrder,
          capacity: capacity,
          isOccupied: isOccupied,
          noOccupants: noOccupants,
        });
      }
    }

  if ((await OrdersCollection.countDocuments()) == 0) {
    // Fetch all existing table numbers
    const allTables = await TablesCollection.find({}, { fields: { tableNo: 1 } }).fetch();
    const availableTableNos = allTables.map(t => t.tableNo);

    // Shuffle table numbers and get up to orderCount amount
    const shuffledTableNos = faker.helpers.shuffle(availableTableNos).slice(0, orderCount);

    // Create orders using these table numbers
    for (let i = 0; i < shuffledTableNos.length; ++i) {
      const tableNo = shuffledTableNos[i];

      const rawMenuItems = await MenuItemsCollection.rawCollection()
        .aggregate([{ $sample: { size: faker.number.int({ min: 0, max: 3 }) } }])
        .toArray();

      const orderMenuItems: OrderMenuItem[] = rawMenuItems.map((item: any) => ({
        name: item.name,
        quantity: faker.number.int({ min: 1, max: 3 }),
        ingredients: item.ingredients ?? [],
        available: item.available ?? true,
        price: item.price ?? 0,
        category: item.category ?? [],
        image: item.image ?? '',
      }));

      // Set orderStatus Pending if no items, otherwise 50% chance Preparing, 30% Ready and 20% Pending
      let orderStatus: OrderStatus;
      if (orderMenuItems.length === 0) {
        orderStatus = OrderStatus.Pending;
      } else {
        orderStatus = faker.datatype.boolean(0.5)
          ? OrderStatus.Preparing
          : faker.datatype.boolean(0.3)
          ? OrderStatus.Ready
          : OrderStatus.Pending
      }

      await OrdersCollection.insertAsync({
        orderNo: faker.number.int({ min: 1000, max: 9999 }),
        tableNo: tableNo,
        menuItems: orderMenuItems,
        totalPrice: orderMenuItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        paid: false,
        orderStatus,
        createdAt: faker.date.recent({ days: 7 }),
      });
    }
  }
};
