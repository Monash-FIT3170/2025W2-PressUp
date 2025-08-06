import { useDraggable } from "@dnd-kit/core";
import type { UiOrder } from "./KitchenMgmtTypes";

type OrderCardProps = {
  order: UiOrder;
};


export const OrderCard = ({order}: OrderCardProps) => {

  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: order._id, 
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  return (
    <div 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes} 
      className="cursor-grab rounded-lg bg-white p-4 shadow-sm hover:shadow-md border-press-up-purple border-3" 
      style={style}
    >
      <h3 className="font-medium text-press-up-purple text-xl">Order #{order.orderNo}</h3>
      <p className="font-bold text-lg  text-press-up-purple">Table {order.tableNo}</p>
      <p className="text-sm text-press-up-purple">{order.createdAt}</p>
      <ul className="mt-3 list-disc list-inside text-lg text-press-up-purple">
        {Array.isArray(order.menuItems) && order.menuItems.length > 0 ? (
          order.menuItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))
        ) : (
          <li className="italic text-sm text-press-up-purple">No items</li>
        )}
      </ul>
    </div>
  );
};