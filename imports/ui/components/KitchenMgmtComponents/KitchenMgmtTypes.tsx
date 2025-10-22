import { IdType } from "/imports/api/database";
import { OrderType, OrderStatus } from "/imports/api/orders/OrdersCollection";

export type UiOrder = {
  _id: IdType;
  orderNo: number;
  orderType: OrderType;
  status: OrderStatus;
  tableNo: number[] | null;
  createdAt: string;
  createdAtMs: number;
  menuItems: Array<{
    name: string;
    quantity: number;
    served?: boolean;
    menuItemId?: any;
    baseIncludedKeys?: string[];
    optionSelections?: Record<string, string[]>;
  }>;
};

export type Column = {
  id: OrderStatus;
  title: string;
};
