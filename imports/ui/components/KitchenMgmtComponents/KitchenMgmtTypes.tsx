export type OrderStatus = "pending" | "preparing" | "ready" | "served";

export type Order = {
  _id: string; 
  orderNo: number;
  status: OrderStatus;
  tableNo: number;
  menuItems: string[];
  createdAt: string;
};

export type Column = {
  id: OrderStatus;
  title: string;
};