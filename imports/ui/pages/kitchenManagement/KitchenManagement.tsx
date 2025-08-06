import { useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { usePageTitle } from "../../hooks/PageTitleContext";
// import Sidebar from "../../components/AddItemSidebar";
import type { UiOrder, Column as ColumnType, OrderStatus }  from "../../components/KitchenMgmtComponents/KitchenMgmtTypes";
import { Column } from "../../components/KitchenMgmtComponents/OrderStatusColumns";
import { useTracker } from "meteor/react-meteor-data";
import { OrdersCollection, Order as DBOrder, OrderMenuItem, OrderStatus as DBStatus } from "../../../api/orders/OrdersCollection";
import { DndContext, DragEndEvent } from "@dnd-kit/core";

const COLUMNS: ColumnType[] = [
  { id: 'pending', title: 'Pending' },
  { id: 'preparing', title: 'Preparing' },
  { id: 'ready', title: 'Ready' },
  { id: 'served', title: 'Served' }, 
];


// const INITIAL_ORDERS: Order[] = [
//   {
//     orderNo: 1,
//     status: 'NEW_ORDERS',
//     tableNo: 1,
//     menuItems: ["Pizza", "Pasta"],
//     createdAt: new Date().toLocaleTimeString().toUpperCase()
//   },
//   {
//     orderNo: 2,
//     status: 'IN_PROGRESS',
//     tableNo: 2,
//     menuItems: ["Burger", "Fries"],
//     createdAt: new Date().toLocaleTimeString().toUpperCase()
//   },
//   {
//     orderNo: 3,
//     status: 'READY',
//     tableNo: 3,
//     menuItems: ["Salad"],
//     createdAt: new Date().toLocaleTimeString().toUpperCase()
//   },
//   {
//     orderNo: 4,
//     status: 'READY',
//     tableNo: 4,
//     menuItems: ["Coffee", "Cake"],
//     createdAt: new Date().toLocaleTimeString().toUpperCase()
//   },
// ];


export const KitchenManagement = () => {
  // Set title
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Kitchen Management");
  }, [setPageTitle]);

  // const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);


  //   const handleDragEnd = (event: DragEndEvent) => {
  //     const { active, over } = event;

  //     if (!over) return;

  //     const orderNo = active.id as number;
  //     const newStatus = over.id as Order['status'];

  //     setOrders(() =>
  //       orders.map((order) =>
  //         order.orderNo === orderNo
  //           ? { ...order, status: newStatus }
  //           : order
  //       )
  //     );
  //   };

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
      menuItems: doc.menuItems,
    }));
  }, []);




    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;
    
      const orderId = active.id as string; 
      const newStatus = over.id as ColumnType["id"];
    
      const newDbStatus = newStatus;
    
      const order = OrdersCollection.findOne({ _id: orderId });
      if (!order) return;
    
      Meteor.call("orders.updateOrder", order._id, {
        orderStatus: newDbStatus
      });
    };
    

 
  return (
    <div className="flex flex-1 overflow-auto">
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
