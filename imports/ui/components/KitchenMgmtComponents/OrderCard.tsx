import { useDraggable } from "@dnd-kit/core";
import type { Order } from "./KitchenMgmtTypes";

type OrderCardProps = {
  order: Order;
};


export const OrderCard = ({order}: OrderCardProps) => {

  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: order.orderNo,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  return (
    <div 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes} 
      className="cursor-grab rounded-lg bg-neutral-700 p-4 shadow-sm hover:shadow-md" 
      style={style}
    >
      <h3 className="font-medium text-neutral-100">{order.orderNo}</h3>
      <p className="mt-2 text-sm text-neutral-400">{order.menuItems.join(", ")}</p>
    </div>
  );
};