import { Meteor } from "meteor/meteor";
import { requireLoginMethod } from "../accounts/wrappers";
import { TablesCollection } from "./TablesCollection";
import { Mongo } from "meteor/mongo";
import { Order } from "../orders/OrdersCollection";

Meteor.methods({
  "tables.addOrder": requireLoginMethod(async function (tableID: Mongo.ObjectID, order: Order) {
    if (!tableID || !order) throw new Meteor.Error("invalid-arguments", "Table ID and Order are required");
    return await TablesCollection.updateAsync(tableID, {$set: {order: order, occupied: true} } );
  }),

  "tables.changeOrder": requireLoginMethod(async function (tableID: Mongo.ObjectID, order: Order) {
    if (!tableID || !order) throw new Meteor.Error("invalid-arguments", "Table ID and order are required");
    return await TablesCollection.updateAsync(tableID, {$set: {order: order} } );
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
