import { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import Sidebar from "../../components/AddItemSidebar";
import type { Order, Column as ColumnType } from "../../components/KitchenMgmtComponents/KitchenMgmtTypes";
import { Column } from "../../components/KitchenMgmtComponents/OrderStatusColumns";
import { DndContext, DragEndEvent } from "@dnd-kit/core";

const COLUMNS: ColumnType[] = [
  { id: 'NEW_ORDERS', title: 'New Orders' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'READY', title: 'Ready' },
];

const INITIAL_ORDERS: Order[] = [
  {
    orderNo: 1,
    status: 'NEW_ORDERS',
    tableNo: 1,
    menuItems: ["Pizza", "Pasta"],
    createdAt: new Date().toLocaleString()
  },
  {
    orderNo: 2,
    status: 'IN_PROGRESS',
    tableNo: 2,
    menuItems: ["Burger", "Fries"],
    createdAt: new Date().toLocaleString()
  },
  {
    orderNo: 3,
    status: 'READY',
    tableNo: 3,
    menuItems: ["Salad"],
    createdAt: new Date().toLocaleString()
  },
];


export const KitchenManagement = () => {
  // Set title
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Kitchen Management");
  }, [setPageTitle]);

  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);


    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) return;

      const orderNo = active.id as number;
      const newStatus = over.id as Order['status'];

      setOrders(() =>
        orders.map((order) =>
          order.orderNo === orderNo
            ? { ...order, status: newStatus }
            : order
        )
      );
    };

 
  return (
    <div className="flex flex-1 overflow-auto">
      {/* Main content area */}
      <div className="p-4">
        <div className="flex gap-8">
          <DndContext onDragEnd={handleDragEnd}>
            {COLUMNS.map((column) => {
              return (
                <Column key={column.id} column={column} orders={orders.filter(order => order.status === column.id)} />
              );
            })}
          </DndContext>
        </div>
      </div>
    </div>
  );
};
