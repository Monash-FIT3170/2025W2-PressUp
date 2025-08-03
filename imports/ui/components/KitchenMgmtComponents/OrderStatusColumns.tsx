import type { Order, Column as ColumnType } from "./KitchenMgmtTypes";
import { OrderCard } from "./OrderCard";

type ColumnProps = {
  column: ColumnType;
  orders: Order[];
};

export const Column = ({column, orders}: ColumnProps) => {
 
  return (
    <div className="flex w-80 flex-col rounded-lg bg-neutral-800 p-4">
      <h2 className="mb-4 font-semibold text-neutral-100">{column.title}</h2>
      <div className="flex flex-1 flex-col gap-4">
        {orders.map(order => {
          return (<OrderCard key={order.orderNo} order={order} />);
        })}
      </div>
    </div>
  );
};