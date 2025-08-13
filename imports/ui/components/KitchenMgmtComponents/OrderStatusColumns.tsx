import { useDroppable } from "@dnd-kit/core";
import type { UiOrder, Column as ColumnType } from "./KitchenMgmtTypes";
import { OrderCard } from "./OrderCard";

type ColumnProps = {
  column: ColumnType;
  orders: UiOrder[];
};

export const Column = ({column, orders}: ColumnProps) => {

  const {setNodeRef} = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex min-w-[200px] flex-col flex-1 rounded-lg bg-press-up-light-purple p-4">
      <h2 className="mb-4 font-semibold text-press-up-purple text-3xl">{column.title}</h2>
      <div ref={setNodeRef} className="flex flex-1 flex-col gap-4">
        {orders.map(order => {
          return (<OrderCard key={order.orderNo} order={order} />);
        })}
      </div>
    </div>
  );
};