import { Mongo } from "meteor/mongo";
import { DBEntry, OmitDB, IdType } from "../database";
import { MenuItem } from "../menuItems/MenuItemsCollection";

export type OrderType = "dine-in" | "takeaway";

// OrderMenuItem reuses MenuItem shape but _id may be optional when created client-side
export type OrderMenuItem = Omit<MenuItem, "_id"> & {
  _id?: IdType;
  served?: boolean;
};

export interface Order extends DBEntry {
  orderNo: number;
  tableNo?: number | null; // null for takeaway orders
  orderType: OrderType;
  menuItems: OrderMenuItem[];
  totalPrice: number;
  originalPrice?: number;
  discountedPrice?: number;
  discountPercent?: number;
  discountAmount?: number;
  createdAt: Date;
  orderStatus: OrderStatus;
  paid: boolean;
}

export enum OrderStatus {
  Pending = "pending",
  Preparing = "preparing",
  Ready = "ready",
  Served = "served",
}

export const OrdersCollection = new Mongo.Collection<OmitDB<Order>, Order>(
  "orders",
);
