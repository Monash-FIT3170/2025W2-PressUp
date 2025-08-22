import { Meteor } from "meteor/meteor";
import { requireLoginMethod } from "../accounts/wrappers";
import { TablesCollection } from "./TablesCollection";
import { Mongo } from "meteor/mongo";

Meteor.methods({
  "tables.addOrder": requireLoginMethod(async function (tableID: Mongo.ObjectID, orderID: string) {
    if (!tableID || !orderID) throw new Meteor.Error("invalid-arguments", "Table ID and Order ID are required");
    return await TablesCollection.updateAsync(tableID, {$set: {orderID: orderID, occupied: true} } );
  }),

  "tables.changeOrder": requireLoginMethod(async function (tableID: Mongo.ObjectID, orderID: string) {
    if (!tableID || !orderID) throw new Meteor.Error("invalid-arguments", "Table ID and Order ID are required");
    return await TablesCollection.updateAsync(tableID, {$set: {orderID: orderID} } );
  }),

  "tables.changeCapacity": requireLoginMethod(async function (tableID: Mongo.ObjectID, newCapacity: number) {
    if (!tableID || !newCapacity) throw new Meteor.Error("invalid-arguments", "Table number and new capacity are required");
    return await TablesCollection.updateAsync(tableID, { $set: {capacity: newCapacity} } );
  }),

  "tables.updateOccupants": requireLoginMethod(async function (tableID: Mongo.ObjectID, occupants: number) {
    if (!tableID || !occupants) throw new Meteor.Error("invalid-arguments", "Table number and number of occupants are required");
    return await TablesCollection.updateAsync(tableID, { $set: {isOccupied: true, noOccupants: occupants} } );
  }),

  "tables.insert": requireLoginMethod(async function (table: {tableNo: number; capacity: number; isOccupied: boolean; orderID: string | null; noOccupants: number; }) {
    if (
      typeof table.tableNo !== "number" ||
      typeof table.capacity !== "number" ||
      typeof table.isOccupied !== "boolean" ||
      typeof table.noOccupants !== "number"
    ) {
      throw new Meteor.Error("invalid-arguments", "Invalid table data");
    }
    return await TablesCollection.insertAsync(table);
  }),
});
