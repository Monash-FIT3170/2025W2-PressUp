import type { Order } from "./KitchenMgmtTypes";

type OrderCardProps = {
  order: Order;
};


export const OrderCard = ({order}: OrderCardProps) => {
 
  return (
    <div className="cursor-grab rounded-lg bg-neutral-700 p-4 shadow-sm hover:shadow-md">
      <h3 className="font-medium text-neutral-100">{order.orderNo}</h3>
      <p className="mt-2 text-sm text-neutral-400">{order.menuItems.join(", ")}</p>
    </div>
  );
};