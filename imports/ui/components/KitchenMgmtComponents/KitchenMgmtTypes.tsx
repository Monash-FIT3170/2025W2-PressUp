export type OrderStatus = 'NEW_ORDERS' | 'IN_PROGRESS' | 'READY' | 'COMPLETED';

export type Order = {
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