import { Meteor } from "meteor/meteor";
import { requireLoginMethod } from "../accounts/wrappers";
import { Tables, TablesCollection } from "./TablesCollection";
import { IdType, OmitDB } from "../database";

Meteor.methods({
  "tables.addOrder": requireLoginMethod(async function (tableID: IdType, orderID: IdType) {
    if (!tableID || !orderID) throw new Meteor.Error("invalid-arguments", "Table ID and Order ID are required");
    return await TablesCollection.updateAsync(tableID, {$set: {orderID: orderID, occupied: true} } );
  }),

  "tables.changeOrder": requireLoginMethod(async function (tableID: IdType, orderID: IdType) {
    if (!tableID || !orderID) throw new Meteor.Error("invalid-arguments", "Table ID and Order ID are required");
    return await TablesCollection.updateAsync(tableID, {$set: {orderID: orderID} } );
  }),

  "tables.changeCapacity": requireLoginMethod(async function (tableID: IdType, newCapacity: number) {
    if (!tableID || !newCapacity) throw new Meteor.Error("invalid-arguments", "Table number and new capacity are required");
    return await TablesCollection.updateAsync(tableID, { $set: {capacity: newCapacity} } );
  }),

  "tables.updateOccupants": requireLoginMethod(async function (tableID: IdType, occupants: number) {
    if (!tableID || !occupants) throw new Meteor.Error("invalid-arguments", "Table number and number of occupants are required");
    return await TablesCollection.updateAsync(tableID, { $set: {isOccupied: true, noOccupants: occupants} } );
  }),

  "tables.addTable": requireLoginMethod(async function (table: OmitDB<Tables>) {
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

  "tables.removeTable": requireLoginMethod(async function (tableID: IdType) {
    if (!tableID) throw new Meteor.Error("invalid-arguments", "Table ID is required");
    return await TablesCollection.removeAsync(tableID);
  }),

});
