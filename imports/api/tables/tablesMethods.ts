import { OrdersCollection } from "../orders/OrdersCollection";
import { Meteor } from "meteor/meteor";
import { requireLoginMethod } from "../accounts/wrappers";
import { Tables, TablesCollection } from "./TablesCollection";
import { IdType, OmitDB } from "../database";

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
    mergedMenuItems: any[];
    mergedTotal: number;
  }) {
    const { tableNos, mergedOrderId, mergedMenuItems, mergedTotal } = params;
    if (!Array.isArray(tableNos) || tableNos.length < 2)
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
    const activeOrderIDs = tables.map((t) => t.activeOrderID).filter(Boolean);
      // Update merged order: set menuItems, totalPrice, and assign all tableNos
      await OrdersCollection.updateAsync(mergedOrderId, {
        $set: {
          menuItems: mergedMenuItems,
          totalPrice: mergedTotal,
          tableNo: tableNos,
        },
      });

    // Remove all other orders (except mergedOrderId) if they exist and are not paid
    for (const oid of activeOrderIDs) {
      if (oid && oid !== mergedOrderId) {
        const order = await OrdersCollection.findOneAsync(oid);
        if (order && !order.paid) {
          await OrdersCollection.removeAsync(oid);
        }
      }
    }

    // Update all tables: set activeOrderID to mergedOrderId, add to orderIDs
    for (const t of tables) {
      await TablesCollection.updateAsync(t._id, {
        $set: { activeOrderID: mergedOrderId, isOccupied: true },
        $addToSet: { orderIDs: mergedOrderId },
      });
    }
    return true;
  }),
});
