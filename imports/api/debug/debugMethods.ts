import { Meteor } from "meteor/meteor";
import { requireLoginMethod } from "../accounts/wrappers";
import { mockMenuItems } from "../menuItems/mock";
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
    await mockDataGenerator({});
  }),

  "debug.mockMenuItems": requireLoginMethod(async function () {
    await mockMenuItems();
  }),

  "debug.mockStockItems": requireLoginMethod(async function () {
    await mockStockItems();
  }),

  "debug.mockSuppliers": requireLoginMethod(async function () {
    await mockSuppliers(10);
  }),

  "debug.mockPurchaseOrders": requireLoginMethod(async function () {
    await mockPurchaseOrders(10);
  }),

  "debug.mockTables": requireLoginMethod(async function () {
    await mockTables(10);
  }),

  "debug.mockOrders": requireLoginMethod(async function () {
    await mockOrders(5);
  }),

  "debug.mockPosts": requireLoginMethod(async function () {
    await mockPosts();
  }),

  "debug.mockComments": requireLoginMethod(async function () {
    await mockComments();
  }),

  "debug.mockShifts": requireLoginMethod(async function () {
    await mockShifts();
  }),

  "debug.mockDeductions": requireLoginMethod(async function () {
    await mockDeductions();
  }),

  // Collection dropping methods
  "debug.dropAll": requireLoginMethod(async function () {
    await MenuItemsCollection.dropCollectionAsync();
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
    await MenuItemsCollection.dropCollectionAsync();
  }),

  "debug.dropStockItems": requireLoginMethod(async function () {
    await StockItemsCollection.dropCollectionAsync();
  }),

  "debug.dropSuppliers": requireLoginMethod(async function () {
    await SuppliersCollection.dropCollectionAsync();
  }),

  "debug.dropPurchaseOrders": requireLoginMethod(async function () {
    await PurchaseOrdersCollection.dropCollectionAsync();
  }),

  "debug.dropTables": requireLoginMethod(async function () {
    await TablesCollection.dropCollectionAsync();
  }),

  "debug.dropOrders": requireLoginMethod(async function () {
    await OrdersCollection.dropCollectionAsync();
  }),

  "debug.dropPosts": requireLoginMethod(async function () {
    await PostsCollection.dropCollectionAsync();
  }),

  "debug.dropComments": requireLoginMethod(async function () {
    await CommentsCollection.dropCollectionAsync();
  }),

  "debug.dropShifts": requireLoginMethod(async function () {
    await ShiftsCollection.dropCollectionAsync();
  }),

  "debug.dropDeductions": requireLoginMethod(async function () {
    await DeductionsCollection.dropCollectionAsync();
  }),
});
