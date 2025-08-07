import { Meteor } from "meteor/meteor";
import { requireLoginMethod } from "../accounts/wrappers";
import { TablesCollection } from "./TablesCollection";
import { Mongo } from "meteor/mongo";

Meteor.methods({
  "tables.addOrder": requireLoginMethod(async function (tableID: Mongo.ObjectID, orderNumber: number) {
    if (!tableID || !orderNumber) throw new Meteor.Error("invalid-arguments", "Table ID and order number are required");
    return await TablesCollection.updateAsync(tableID, {$set: {orderNo: orderNumber, occuped: true} } );
  }),

  "tables.changeOrder": requireLoginMethod(async function (tableID: Mongo.ObjectID, orderNumber: number) {
    if (!tableID || !orderNumber) throw new Meteor.Error("invalid-arguments", "Table ID and order number are required");
    return await TablesCollection.updateAsync(tableID, {$set: {orderNo: orderNumber} } );
  }),

  "tables.changeCapacity": requireLoginMethod(async function (tableID: Mongo.ObjectID, newCapacity: number) {
    if (!tableID || !newCapacity) throw new Meteor.Error("invalid-arguments", "Table number and new capacity are required");
    return await TablesCollection.updateAsync(tableID, { $set: {capacity: newCapacity} } );
  }),

  "tables.updateOccupants": requireLoginMethod(async function (tableID: Mongo.ObjectID, occupants: number) {
    if (!tableID || !occupants) throw new Meteor.Error("invalid-arguments", "Table number and number of occupants are required");
    return await TablesCollection.updateAsync(tableID, { $set: {isOccupied: true, noOccupants: occupants} } );
  }),
});
