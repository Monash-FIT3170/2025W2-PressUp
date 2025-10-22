import { Meteor } from "meteor/meteor";
import { requireLoginMethod } from "../accounts/wrappers";
import { Tables, TablesCollection, TableBooking } from "./TablesCollection";
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
});
