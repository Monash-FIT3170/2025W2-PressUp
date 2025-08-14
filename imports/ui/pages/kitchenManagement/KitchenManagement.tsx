import { useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { usePageTitle } from "../../hooks/PageTitleContext";
// import Sidebar from "../../components/AddItemSidebar";
import type { UiOrder, Column as ColumnType, OrderStatus }  from "../../components/KitchenMgmtComponents/KitchenMgmtTypes";
import { Column } from "../../components/KitchenMgmtComponents/OrderStatusColumns";
import { useTracker } from "meteor/react-meteor-data";
import { OrdersCollection, Order as DBOrder } from "../../../api/orders/OrdersCollection";
import { DndContext, DragEndEvent } from "@dnd-kit/core";

const COLUMNS: ColumnType[] = [
  { id: 'pending', title: 'Pending' },
  { id: 'preparing', title: 'Preparing' },
  { id: 'ready', title: 'Ready' },
];

export const KitchenManagement = () => {
  // Set title
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Kitchen Management");
  }, [setPageTitle]);

  const orders: UiOrder[] = useTracker(() => {
    const handler = Meteor.subscribe("orders");
    if (!handler.ready()) return [];
  
    const docs = OrdersCollection.find().fetch();
  
    return docs.map((doc: DBOrder): UiOrder => ({
      _id: doc._id as string, 
      orderNo: doc.orderNo,
      tableNo: doc.tableNo,
      createdAt: new Date(doc.createdAt).toLocaleTimeString().toUpperCase(),
      status: doc.orderStatus as OrderStatus, 
      menuItems: (doc.menuItems ?? []).map((it: any) => ({
        name: it.name,
        quantity: typeof it.quantity === "number" ? it.quantity : 1,
        served: typeof it.served === "boolean" ? it.served : false,
      })),
    }));
  }, []);


  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;
  
    const orderId = String(active.id);                 
    const newStatus = over.id as ColumnType["id"];     
  
    Meteor.call(
      "orders.updateOrder",
      orderId,
      { orderStatus: newStatus },
      (err: Meteor.Error | undefined) => {
        if (err) {
          console.error(err);
          alert(`fail to update: ${err.reason || err.message}`);
        }
      }
    );
  };
    

 
  return (
    <div className="flex-1 w-full overflow-auto">
      {/* Main content area */}
      <div className="p-4">
        <div className="flex gap-10">
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
