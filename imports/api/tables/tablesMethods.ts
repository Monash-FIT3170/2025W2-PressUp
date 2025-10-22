import { OrderMenuItem, OrdersCollection } from "../orders/OrdersCollection";
import { Meteor } from "meteor/meteor";
import { requireLoginMethod } from "../accounts/wrappers";
import { Tables, TablesCollection, TableBooking } from "./TablesCollection";
import { IdType, OmitDB } from "../database";

// Helper function to check if a booking is expired (more than 1 hour old)
const isBookingExpired = (bookingDate: Date) => {
  const now = new Date();
  const oneHourAgo = new Date(bookingDate.getTime() + 60 * 60 * 1000);
  return now > oneHourAgo;
};

Meteor.methods({
  "tables.addOrder": requireLoginMethod(async function (
    tableID: IdType,
    orderIDs: IdType,
  ) {
    if (!tableID || !orderIDs)
      throw new Meteor.Error(
        "invalid-arguments",
        "Table ID and Order ID are required",
      );
    // Push to orderIDs history and set activeOrderID
    return await TablesCollection.updateAsync(tableID, {
      $set: { activeOrderID: orderIDs, isOccupied: true },
      $push: { orderIDs: orderIDs },
    });
  }),

  "tables.changeOrder": requireLoginMethod(async function (
    tableID: IdType,
    orderIDs: IdType,
  ) {
    if (!tableID || !orderIDs)
      throw new Meteor.Error(
        "invalid-arguments",
        "Table ID and Order ID are required",
      );
    // Set new activeOrderID and push to history
    return await TablesCollection.updateAsync(tableID, {
      $set: { activeOrderID: orderIDs },
      $push: { orderIDs: orderIDs },
    });
  }),

  "tables.changeCapacity": requireLoginMethod(async function (
    tableID: IdType,
    newCapacity: number,
  ) {
    if (!tableID || !newCapacity)
      throw new Meteor.Error(
        "invalid-arguments",
        "Table number and new capacity are required",
      );

    // --- validation: must be between 1 and 12 ---
    if (
      typeof newCapacity !== "number" ||
      newCapacity < 1 ||
      newCapacity > 12
    ) {
      throw new Meteor.Error(
        "invalid-capacity",
        "Capacity must be between 1 and 12",
      );
    }

    return await TablesCollection.updateAsync(tableID, {
      $set: { capacity: newCapacity },
    });
  }),

  "tables.updateOccupants": requireLoginMethod(async function (
    tableID: IdType,
    occupants: number,
  ) {
    if (!tableID || !occupants)
      throw new Meteor.Error(
        "invalid-arguments",
        "Table number and number of occupants are required",
      );
    return await TablesCollection.updateAsync(tableID, {
      $set: { isOccupied: true, noOccupants: occupants },
    });
  }),

  "tables.setOccupied": requireLoginMethod(async function (
    tableID: IdType,
    isOccupied: boolean,
    occupants: number,
  ) {
    if (!tableID || typeof isOccupied !== "boolean")
      throw new Meteor.Error(
        "invalid-arguments",
        "Table ID and occupancy flag are required",
      );
    const updateOps: {
      $set?: Partial<Tables>;
      $unset?: { [k: string]: "" };
    } = {};
    if (isOccupied) {
      updateOps.$set = { isOccupied };
      if (typeof occupants === "number") {
        updateOps.$set.noOccupants = occupants;
      }
    } else {
      // set isOccupied false and remove noOccupants from DB
      updateOps.$set = { isOccupied };
      updateOps.$unset = { noOccupants: "" };
    }

    return await TablesCollection.updateAsync(tableID, updateOps);
  }),

  "tables.clearOrder": requireLoginMethod(async function (tableID: IdType) {
    if (!tableID)
      throw new Meteor.Error("invalid-arguments", "Table ID is required");
    // clear activeOrderID, unset noOccupants and mark not occupied
    await TablesCollection.updateAsync(tableID, {
      $set: { activeOrderID: null, isOccupied: false },
    });
    return await TablesCollection.updateAsync(tableID, {
      $unset: { noOccupants: "" },
    });
  }),

  "tables.addTable": requireLoginMethod(async function (table: OmitDB<Tables>) {
    // Basic type checks
    if (
      typeof table.tableNo !== "number" ||
      typeof table.capacity !== "number" ||
      typeof table.isOccupied !== "boolean" ||
      typeof table.noOccupants !== "number"
    ) {
      throw new Meteor.Error("invalid-arguments", "Invalid table data");
    }

    // --- capacity range guard (server-side) ---
    // ensure capacity is within 1..12 even if client bypasses UI
    if (table.capacity < 1 || table.capacity > 12) {
      throw new Meteor.Error(
        "invalid-capacity",
        "Capacity must be between 1 and 12",
      );
    }

    // optional: also ensure noOccupants <= capacity
    if (table.noOccupants < 0 || table.noOccupants > table.capacity) {
      throw new Meteor.Error(
        "invalid-occupants",
        "Occupants cannot exceed capacity",
      );
    }

    return await TablesCollection.insertAsync(table);
  }),

  "tables.removeTable": requireLoginMethod(async function (tableID: IdType) {
    if (!tableID)
      throw new Meteor.Error("invalid-arguments", "Table ID is required");
    return await TablesCollection.removeAsync(tableID);
  }),

  "tables.mergeTablesAndOrders": requireLoginMethod(async function (params: {
    tableNos: number[];
    mergedOrderId: string;
    mergedMenuItems?: OrderMenuItem[] | null;
    mergedTotal?: number;
  }) {
    const { tableNos, mergedOrderId } = params;
    if (!tableNos || tableNos.length < 2)
      throw new Meteor.Error(
        "invalid-arguments",
        "At least two tables required",
      );
    if (!mergedOrderId)
      throw new Meteor.Error("invalid-arguments", "Merged order ID required");

    // Find all tables
    const tables = await TablesCollection.find({
      tableNo: { $in: tableNos },
    }).fetchAsync();
    if (tables.length !== tableNos.length)
      throw new Meteor.Error("not-found", "Some tables not found");

    // Find all active orders for these tables
    const activeOrderIDs = tables
      .map((t) => t.activeOrderID)
      .filter(Boolean) as string[];

    // Load the current merged order to preserve any previously-merged tables
    const currentMergedOrder =
      await OrdersCollection.findOneAsync(mergedOrderId);
    const currentMergedTableNos: number[] =
      currentMergedOrder?.tableNo != null ? currentMergedOrder.tableNo : [];

    // Also include any tables which currently reference the merged order
    const tablesPointingToMerged = await TablesCollection.find({
      activeOrderID: mergedOrderId,
    }).fetchAsync();
    const tablesPointingNos = tablesPointingToMerged.map(
      (t) => t.tableNo as number,
    );

    // Compute union of selected tableNos, currentMergedTableNos, and tables already pointing to merged order
    const unionTableNos = Array.from(
      new Set([
        ...(tableNos || []),
        ...currentMergedTableNos,
        ...tablesPointingNos,
      ]),
    ).sort((a, b) => a - b);

    // --- Merge menu items from all orders ---
    // Load all active orders (including mergedOrderId)
    const allOrderIDs = Array.from(new Set([...activeOrderIDs, mergedOrderId]));
    const allOrders = await OrdersCollection.find({
      _id: { $in: allOrderIDs },
    } as any).fetchAsync();
    // Flatten all menu items
    const allMenuItems = allOrders.flatMap((o) => o.menuItems || []);

    // Helper: compare two menu items for merge (same menuItemId, options, baseIncludedKeys, modifiers)
    function menuItemsEqual(a: OrderMenuItem, b: OrderMenuItem) {
      if (a.menuItemId !== b.menuItemId) return false;
      // Compare optionSelections
      const selectionA = a.optionSelections || {};
      const selectionB = b.optionSelections || {};
      const keysA = Object.keys(selectionA).sort();
      const keysB = Object.keys(selectionB).sort();
      if (keysA.length !== keysB.length) return false;
      for (let i = 0; i < keysA.length; i++) {
        if (keysA[i] !== keysB[i]) return false;
        const selectedOptionsA = selectionA[keysA[i]].slice().sort();
        const selectedOptionsB = selectionB[keysB[i]].slice().sort();
        if (
          selectedOptionsA.length !== selectedOptionsB.length ||
          selectedOptionsA.some(
            (v: any, idx: number) => v !== selectedOptionsB[idx],
          )
        )
          return false;
      }
      // Compare baseIncludedKeys
      const baseA = a.baseIncludedKeys ? a.baseIncludedKeys.slice().sort() : [];
      const baseB = b.baseIncludedKeys ? b.baseIncludedKeys.slice().sort() : [];
      if (
        baseA.length !== baseB.length ||
        baseA.some((v: any, idx: number) => v !== baseB[idx])
      )
        return false;
      // Compare modifiers (by key/label/priceDelta)
      const modA = a.modifiers ? a.modifiers : [];
      const modB = b.modifiers ? b.modifiers : [];
      if (modA.length !== modB.length) return false;
      for (let i = 0; i < modA.length; i++) {
        if (
          modA[i].key !== modB[i].key ||
          modA[i].label !== modB[i].label ||
          modA[i].priceDelta !== modB[i].priceDelta
        )
          return false;
      }
      return true;
    }

    // Merge: sum quantities for identical items
    const mergedMenuItems: OrderMenuItem[] = [];
    for (const item of allMenuItems) {
      const found = mergedMenuItems.find((it) => menuItemsEqual(it, item));
      if (found) {
        found.quantity += item.quantity;
      } else {
        mergedMenuItems.push({ ...item });
      }
    }

    // Recompute total
    const mergedTotal = mergedMenuItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0,
    );

    // Update merged order: set menuItems, totalPrice, and assign all tableNos (union)
    await OrdersCollection.updateAsync(mergedOrderId, {
      $set: {
        menuItems: mergedMenuItems,
        totalPrice: mergedTotal,
        tableNo: unionTableNos,
      },
    });

    // Identify other order IDs to merge into mergedOrderId (exclude mergedOrderId itself)
    const otherOrderIDs = activeOrderIDs.filter((id) => id !== mergedOrderId);

    // For any tables that referenced those other orders, update them to point to mergedOrderId
    if (otherOrderIDs.length > 0) {
      const tablesReferencingOthers = await TablesCollection.find({
        activeOrderID: { $in: otherOrderIDs },
      }).fetchAsync();
      for (const t of tablesReferencingOthers) {
        await TablesCollection.updateAsync(t._id, {
          $set: { activeOrderID: mergedOrderId, isOccupied: true },
          $addToSet: { orderIDs: mergedOrderId },
        });
      }
    }

    // Remove all other orders (except mergedOrderId) if they exist and are not paid
    for (const orderID of otherOrderIDs) {
      if (orderID) {
        const order = await OrdersCollection.findOneAsync(orderID);
        if (order && !order.paid) {
          await OrdersCollection.removeAsync(orderID);
        }
      }
    }

    // Update all originally selected tables: set activeOrderID to mergedOrderId, add to orderIDs
    for (const t of tables) {
      await TablesCollection.updateAsync(t._id, {
        $set: { activeOrderID: mergedOrderId, isOccupied: true },
        $addToSet: { orderIDs: mergedOrderId },
      });
    }
    return true;
  }),

  // Split selected tables out of a merged order by cloning the merged order per table
  "tables.splitTablesFromOrder": requireLoginMethod(async function (params: {
    orderId: string;
    tableNos: number[];
  }) {
    const { orderId, tableNos } = params;
    if (!orderId || !tableNos || tableNos.length === 0)
      throw new Meteor.Error(
        "invalid-arguments",
        "Order ID and at least one table number are required",
      );

    // Load the original merged order
    const mergedOrder = await OrdersCollection.findOneAsync(orderId);
    if (!mergedOrder)
      throw new Meteor.Error("order-not-found", "Order not found");

    // Normalise current merged table numbers to an array
    const currentTableNos: number[] =
      mergedOrder.tableNo != null ? mergedOrder.tableNo : [];

    // Validate requested tables exist in DB
    const tables = await TablesCollection.find({
      tableNo: { $in: tableNos },
    }).fetchAsync();
    if (tables.length !== tableNos.length)
      throw new Meteor.Error("not-found", "Some tables not found");

    // Compute starting orderNo (reuse orders.addOrder logic)
    const last = await OrdersCollection.find(
      {},
      { sort: { orderNo: -1 }, limit: 1 },
    ).fetchAsync();
    let nextOrderNo = 1001;
    if (last.length > 0 && typeof last[0].orderNo === "number")
      nextOrderNo = last[0].orderNo + 1;

    const created: { tableNo: number; orderId: string }[] = [];

    for (const tableNo of tableNos) {
      // Deep copy menu items (preserve all customisations and duplicates)
      const menuItems = JSON.parse(JSON.stringify(mergedOrder.menuItems ?? []));
      const totalPrice = menuItems.reduce(
        (sum: number, item: { price: number; quantity: number }) =>
          sum + (item.price || 0) * (item.quantity || 1),
        0,
      );

      const newOrder: any = {
        orderNo: nextOrderNo,
        tableNo: [tableNo],
        orderType: mergedOrder.orderType,
        menuItems,
        totalPrice: totalPrice,
        originalPrice: mergedOrder.originalPrice,
        discountedPrice: mergedOrder.discountedPrice,
        discountPercent: mergedOrder.discountPercent,
        discountAmount: mergedOrder.discountAmount,
        createdAt: new Date(),
        orderStatus: mergedOrder.orderStatus ?? "pending",
        paid: false,
      };

      const newOrderId = await OrdersCollection.insertAsync(newOrder);
      created.push({ tableNo: tableNo, orderId: newOrderId });
      nextOrderNo++;

      // Assign new order to the table record
      const table = tables.find((x) => x.tableNo === tableNo);
      if (table && table._id) {
        await TablesCollection.updateAsync(table._id, {
          $set: { activeOrderID: newOrderId, isOccupied: true },
          $addToSet: { orderIDs: newOrderId },
        });
      }
    }

    // Remove split table numbers from original merged order
    const remaining = currentTableNos.filter((n) => !tableNos.includes(n));
    if (remaining.length > 0) {
      const sorted = [...new Set(remaining)].sort((a, b) => a - b);
      await OrdersCollection.updateAsync(orderId, {
        $set: { tableNo: sorted },
      });
    } else {
      // No tables remain on merged order — remove it if unpaid, otherwise set tableNo to null
      if (!mergedOrder.paid) {
        await OrdersCollection.removeAsync(orderId);
      } else {
        await OrdersCollection.updateAsync(orderId, {
          $set: { tableNo: null },
        });
      }
    }

    return { created };
  }),

  "tables.addBooking": requireLoginMethod(async function (
    tableID: IdType,
    booking: Omit<TableBooking, "bookingDate"> & { bookingDate: string },
  ) {
    if (!tableID || !booking)
      throw new Meteor.Error(
        "invalid-arguments",
        "Table ID and booking details are required",
      );

    // Validate booking fields
    if (!booking.customerName || !booking.customerPhone || !booking.partySize) {
      throw new Meteor.Error(
        "invalid-booking",
        "Customer name, phone, and party size are required",
      );
    }

    // Validate party size (must be positive)
    if (booking.partySize <= 0) {
      throw new Meteor.Error(
        "invalid-party-size",
        "Party size must be greater than 0",
      );
    }

    // Convert date string to Date object
    const bookingDate = new Date(booking.bookingDate);
    if (isNaN(bookingDate.getTime())) {
      throw new Meteor.Error("invalid-date", "Invalid booking date");
    }

    // Don't allow bookings in the past
    if (bookingDate < new Date()) {
      throw new Meteor.Error(
        "invalid-date",
        "Booking date must be in the future",
      );
    }

    // Add booking to table
    const newBooking: TableBooking = {
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      partySize: booking.partySize,
      bookingDate,
      notes: booking.notes,
    };

    return await TablesCollection.updateAsync(tableID, {
      $push: {
        bookings: newBooking,
      },
    });
  }),

  "tables.removeBooking": requireLoginMethod(async function (
    tableID: IdType,
    bookingDate: string,
  ) {
    if (!tableID || !bookingDate)
      throw new Meteor.Error(
        "invalid-arguments",
        "Table ID and booking date are required",
      );

    const date = new Date(bookingDate);
    if (isNaN(date.getTime())) {
      throw new Meteor.Error("invalid-date", "Invalid booking date");
    }

    return await TablesCollection.updateAsync(tableID, {
      $pull: {
        bookings: {
          bookingDate: date,
        },
      },
    });
  }),

  "tables.cleanupExpiredBookings": requireLoginMethod(async function () {
    // Find all tables with bookings
    const tables = await TablesCollection.find({
      bookings: { $exists: true },
    }).fetchAsync();

    for (const table of tables) {
      if (!table.bookings || table.bookings.length === 0) continue;

      // Filter out expired bookings
      const currentBookings = table.bookings.filter(
        (booking) => !isBookingExpired(booking.bookingDate),
      );

      // If the number of bookings changed, update the table
      if (currentBookings.length !== table.bookings.length) {
        await TablesCollection.updateAsync(table._id, {
          $set: { bookings: currentBookings },
        });

        // If this was the last current booking, also clear occupancy
        const hasCurrentBooking = currentBookings.some((booking) => {
          const now = new Date();
          const bookingTime = new Date(booking.bookingDate);
          const oneHourAfterBooking = new Date(
            bookingTime.getTime() + 60 * 60 * 1000,
          );
          return now >= bookingTime && now <= oneHourAfterBooking;
        });

        if (!hasCurrentBooking && table.isOccupied) {
          await TablesCollection.updateAsync(table._id, {
            $set: { isOccupied: false },
            $unset: { noOccupants: "" },
          });
        }
      }
    }
    return true;
  }),
});
