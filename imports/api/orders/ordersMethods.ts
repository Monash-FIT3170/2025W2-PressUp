import { Meteor } from "meteor/meteor";
import { Order, OrdersCollection } from "./OrdersCollection";
import { check } from "meteor/check";
import { requireLoginMethod } from "../accounts/wrappers";
import { IdType } from "../database";
import { Roles } from "meteor/alanning:roles";
import { RoleEnum } from "../accounts/roles";

Meteor.methods({
  "orders.updateOrder": requireLoginMethod(async function (
    orderId: IdType,
    update: Partial<Order>,
  ) {
    if (!orderId || !update)
      throw new Meteor.Error(
        "invalid-arguments",
        "Order ID and update are required",
      );
    // Fetch the existing order to check locked state
    const existingOrder = await OrdersCollection.findOneAsync(
      orderId as IdType,
    );
    if (!existingOrder) {
      throw new Meteor.Error("order-not-found", "Order not found");
    }

    // If the order is locked, only managers may update it
    if (existingOrder.isLocked) {
      if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.MANAGER]))) {
        throw new Meteor.Error(
          "order-locked",
          "Order is locked and cannot be edited",
        );
      }
    }

    return await OrdersCollection.updateAsync(orderId, { $set: update });
  }),

  "orders.addOrder": requireLoginMethod(async function (order: Order) {
    if (!order)
      throw new Meteor.Error("invalid-arguments", "Order data is required");
    return await OrdersCollection.insertAsync(order);
  }),

  "orders.getAll": requireLoginMethod(async function () {
    return OrdersCollection.find().fetch();
  }),

  "orders.setMenuItemServed": requireLoginMethod(async function (
    orderId: IdType,
    index: number,
    served: boolean,
  ) {
    check(orderId, String);
    check(index, Number);
    check(served, Boolean);
    return await OrdersCollection.updateAsync(orderId, {
      $set: { [`menuItems.${index}.served`]: served },
    });
  }),

  "orders.setAllMenuItemsServed": requireLoginMethod(async function (
    orderId: IdType,
    served: boolean,
  ) {
    check(orderId, String);
    check(served, Boolean);
    return await OrdersCollection.updateAsync(orderId, {
      $set: { "menuItems.$[].served": served },
    });
  }),

  "orders.setLocked": requireLoginMethod(async function (
    orderId: IdType,
    locked: boolean,
  ) {
    check(orderId, String);
    check(locked, Boolean);
    // Only managers can change the locked state
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.MANAGER]))) {
      throw new Meteor.Error(
        "invalid-permissions",
        "No permissions to edit locked state.",
      );
    }
    return await OrdersCollection.updateAsync(orderId, {
      $set: { isLocked: locked },
    });
  }),
});
