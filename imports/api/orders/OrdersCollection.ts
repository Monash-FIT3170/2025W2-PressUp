import { Mongo } from "meteor/mongo";
import { DBEntry, OmitDB, IdType } from "../database";

export type OptionSelections = Record<string, string[]>;

export type OrderModifier = {
  key: string;
  label: string;
  priceDelta: number;
};

// OrderMenuItem reuses MenuItem shape but _id may be optional when created client-side
export type OrderMenuItem = {
  _id?: IdType;     
  lineId?: string;        
  menuItemId?: IdType;         
  name: string;             
  quantity: number;
  basePrice: number;        
  price: number;            
  ingredients: string[];     
  modifiers?: OrderModifier[]; 
  baseIncludedKeys?: string[];
  optionSelections?: OptionSelections; 
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
  isLocked?: boolean;
}

export enum OrderStatus {
  Pending = "pending",
  Preparing = "preparing",
  Ready = "ready",
  Served = "served",
  Paid = "paid",
}

export enum OrderType {
  DineIn = "dine-in",
  Takeaway = "takeaway",
}

export const OrdersCollection = new Mongo.Collection<OmitDB<Order>, Order>(
  "orders",
);
