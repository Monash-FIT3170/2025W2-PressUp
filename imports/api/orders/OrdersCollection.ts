import { Mongo } from "meteor/mongo";
import { DBEntry, OmitDB } from "../database";

export interface OrderMenuItem {
    name: string;
    quantity: number;
    ingredients: string[];
    available: boolean;
    price: number;
    category?: string[];
    image: string;
    served?: boolean;
}

export interface Order extends DBEntry {
    orderNo: number;
    tableNo: number;
    menuItems: OrderMenuItem[];
    totalPrice: number;
    originalPrice?: number;
    discountedPrice?: number;
    discountPercent?: number;
    discountAmount?: number;
    createdAt: Date;
    orderStatus: OrderStatus;
    paid: boolean;
    seats?: number;
}

export enum OrderStatus {
    Pending = "pending",
    Preparing = "preparing",
    Ready = "ready",
    Served = "served"
}

export const OrdersCollection = new Mongo.Collection<OmitDB<Order>, Order>("orders");
