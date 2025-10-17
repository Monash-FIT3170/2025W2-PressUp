import { useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { usePageTitle } from "../../hooks/PageTitleContext";
import type {
  UiOrder,
  Column as ColumnType,
} from "../../components/KitchenMgmtComponents/KitchenMgmtTypes";
import { Column } from "../../components/KitchenMgmtComponents/OrderStatusColumns";
import { useTracker } from "meteor/react-meteor-data";
import {
  OrdersCollection,
  Order as DBOrder,
  OrderStatus,
} from "../../../api/orders/OrdersCollection";
import { DndContext, DragEndEvent } from "@dnd-kit/core";

const COLUMNS: ColumnType[] = [
  { id: OrderStatus.Pending, title: "Pending" },
  { id: OrderStatus.Preparing, title: "Preparing" },
  { id: OrderStatus.Ready, title: "Ready" },
];

export const KitchenManagement = () => {
  // Set title
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Kitchen Management - Current Tickets");
  }, [setPageTitle]);

  const orders: UiOrder[] = useTracker(() => {
    const handler = Meteor.subscribe("orders");
    if (!handler.ready()) return [];

    const docs = OrdersCollection.find().fetch();

    return docs.map((doc: DBOrder): UiOrder => {
      const created =
        doc.createdAt instanceof Date
          ? doc.createdAt
          : new Date(doc.createdAt as Date);

      return {
        _id: doc._id,
        orderNo: doc.orderNo,
        tableNo: doc.tableNo ?? null,
        orderType: doc.orderType,
        createdAt: new Date(doc.createdAt).toLocaleTimeString().toUpperCase(),
        createdAtMs: created.getTime(),
        status: doc.orderStatus,
        menuItems: (doc.menuItems ?? []).map((it) => ({
          name: it.name,
          quantity: typeof it.quantity === "number" ? it.quantity : 1,
          served: it.served === true,

          menuItemId: it.menuItemId,
          baseIncludedKeys: it.baseIncludedKeys,
          optionSelections: it.optionSelections,
        })),
      };
    });
  }, []);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;

    const orderId = String(active.id);
    const next = String(over.id) as OrderStatus;

    Meteor.call(
      "orders.updateOrder",
      orderId,
      { orderStatus: next },
      (err: Meteor.Error | undefined) => {
        if (err) {
          console.error(err);
          alert(`fail to update: ${err.reason || err.message}`);
        }
      },
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
                <Column
                  key={column.id}
                  column={column}
                  orders={orders.filter((order) => order.status === column.id)}
                />
              );
            })}
          </DndContext>
        </div>
      </div>
    </div>
  );
};
