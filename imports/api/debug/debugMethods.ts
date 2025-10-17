import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { requireLoginMethod } from "../accounts/wrappers";
import { RoleEnum } from "../accounts/roles";
import { mockMenuItems, mockItemCategories } from "../menuItems/mock";
import { mockStockItems } from "../stockItems/mock";
import { mockSuppliers } from "../suppliers/mock";
import { mockPurchaseOrders } from "../purchaseOrders/mock";
import { mockTables } from "../tables/mock";
import { mockOrders } from "../orders/mock";
import { mockPosts, mockComments } from "../posts/mock";
import { mockShifts } from "../shifts/mock";
import { mockDeductions } from "../tax/mock";
import { mockDataGenerator } from "../mock/mockData";

import { MenuItemsCollection } from "../menuItems/MenuItemsCollection";
import { ItemCategoriesCollection } from "../menuItems/ItemCategoriesCollection";
import { StockItemsCollection } from "../stockItems/StockItemsCollection";
import { SuppliersCollection } from "../suppliers/SuppliersCollection";
import { PurchaseOrdersCollection } from "../purchaseOrders/PurchaseOrdersCollection";
import { TablesCollection } from "../tables/TablesCollection";
import { OrdersCollection } from "../orders/OrdersCollection";
import { PostsCollection } from "../posts/PostsCollection";
import { CommentsCollection } from "../posts/CommentsCollection";
import { ShiftsCollection } from "../shifts/ShiftsCollection";
import { DeductionsCollection } from "../tax/DeductionsCollection";

Meteor.methods({
  // Mock data generation methods
  "debug.mockAll": requireLoginMethod(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can perform debug operations",
      );
    }
    await mockDataGenerator({});
  }),

  "debug.mockMenuItems": requireLoginMethod(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can perform debug operations",
      );
    }
    await mockMenuItems();
  }),

  "debug.mockItemCategories": requireLoginMethod(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can perform debug operations",
      );
    }
    await mockItemCategories();
  }),

  "debug.mockStockItems": requireLoginMethod(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can perform debug operations",
      );
    }
    await mockStockItems();
  }),

  "debug.mockSuppliers": requireLoginMethod(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can perform debug operations",
      );
    }
    await mockSuppliers(30);
  }),

  "debug.mockPurchaseOrders": requireLoginMethod(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can perform debug operations",
      );
    }
    await mockPurchaseOrders(100);
  }),

  "debug.mockTables": requireLoginMethod(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can perform debug operations",
      );
    }
    await mockTables(10);
  }),

  "debug.mockOrders": requireLoginMethod(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can perform debug operations",
      );
    }
    await mockOrders(5);
  }),

  "debug.mockPosts": requireLoginMethod(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can perform debug operations",
      );
    }
    await mockPosts(5);
  }),

  "debug.mockComments": requireLoginMethod(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can perform debug operations",
      );
    }
    await mockComments(10);
  }),

  "debug.mockShifts": requireLoginMethod(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can perform debug operations",
      );
    }
    await mockShifts();
  }),

  "debug.mockDeductions": requireLoginMethod(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can perform debug operations",
      );
    }
    await mockDeductions(8);
  }),

  // Collection dropping methods
  "debug.dropAll": requireLoginMethod(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can perform debug operations",
      );
    }
    await MenuItemsCollection.dropCollectionAsync();
    await ItemCategoriesCollection.dropCollectionAsync();
    await StockItemsCollection.dropCollectionAsync();
    await SuppliersCollection.dropCollectionAsync();
    await PurchaseOrdersCollection.dropCollectionAsync();
    await TablesCollection.dropCollectionAsync();
    await OrdersCollection.dropCollectionAsync();
    await PostsCollection.dropCollectionAsync();
    await CommentsCollection.dropCollectionAsync();
    await ShiftsCollection.dropCollectionAsync();
    await DeductionsCollection.dropCollectionAsync();
  }),

  "debug.dropMenuItems": requireLoginMethod(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can perform debug operations",
      );
    }
    await MenuItemsCollection.dropCollectionAsync();
  }),

  "debug.dropItemCategories": requireLoginMethod(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can perform debug operations",
      );
    }
    await ItemCategoriesCollection.dropCollectionAsync();
  }),

  "debug.dropStockItems": requireLoginMethod(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can perform debug operations",
      );
    }
    await StockItemsCollection.dropCollectionAsync();
  }),

  "debug.dropSuppliers": requireLoginMethod(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can perform debug operations",
      );
    }
    await SuppliersCollection.dropCollectionAsync();
  }),

  "debug.dropPurchaseOrders": requireLoginMethod(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can perform debug operations",
      );
    }
    await PurchaseOrdersCollection.dropCollectionAsync();
  }),

  "debug.dropTables": requireLoginMethod(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can perform debug operations",
      );
    }
    await TablesCollection.dropCollectionAsync();
  }),

  "debug.dropOrders": requireLoginMethod(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can perform debug operations",
      );
    }
    await OrdersCollection.dropCollectionAsync();
  }),

  "debug.dropPosts": requireLoginMethod(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can perform debug operations",
      );
    }
    await PostsCollection.dropCollectionAsync();
  }),

  "debug.dropComments": requireLoginMethod(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can perform debug operations",
      );
    }
    await CommentsCollection.dropCollectionAsync();
  }),

  "debug.dropShifts": requireLoginMethod(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can perform debug operations",
      );
    }
    await ShiftsCollection.dropCollectionAsync();
  }),

  "debug.dropDeductions": requireLoginMethod(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can perform debug operations",
      );
    }
    await DeductionsCollection.dropCollectionAsync();
  }),
});
