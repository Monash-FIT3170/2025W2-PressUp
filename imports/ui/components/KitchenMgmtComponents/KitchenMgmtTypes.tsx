import { IdType } from "/imports/api/database";

export type OrderStatus = "pending" | "preparing" | "ready" | "served";

export type UiOrder = {
  _id: IdType;
  orderNo: number;
  status: OrderStatus;
  tableNo: number | null;
  createdAt: string;
  createdAtMs: number;
  menuItems: Array<{
    name: string;
    quantity: number;
    served?: boolean;
  }>;
};

export type Column = {
  id: OrderStatus;
  title: string;
};
