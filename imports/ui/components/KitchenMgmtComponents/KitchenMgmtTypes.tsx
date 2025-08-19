export type OrderStatus = "pending" | "preparing" | "ready" | "served";

export type UiOrder = {
  _id: string; 
  orderNo: number;
  status: OrderStatus;
  tableNo: number;
  createdAt: string;
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