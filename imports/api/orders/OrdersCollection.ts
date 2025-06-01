import { Mongo } from "meteor/mongo";
import { DBEntry } from "../database";

export interface OrderMenuItem {
    name: string;
    quantity: number;
    ingredients: string[];
    available: boolean;
    price: number;
    category?: string[];
    image: string;
}

export interface Order extends DBEntry {
    orderNo: number;
    tableNo: number;
    menuItems: OrderMenuItem[];
    totalPrice: number;
    discountedPrice?: number;
    discountPercent?: number;
    discountAmount?: number;
    createdAt: Date;
    orderStatus: string;
    paid: boolean;
}

export enum OrderStatus {
    Pending = "pending",
    Preparing = "preparing",
    Ready = "ready",
    Served = "served"
}

export const OrdersCollection = new Mongo.Collection<Order>("orders");
