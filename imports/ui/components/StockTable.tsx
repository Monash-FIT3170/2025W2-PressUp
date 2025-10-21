import React, { useMemo } from "react";
import { LineItemWithDetails } from "../pages/inventory/types";
import { OutOfStock, InStock, LowInStock } from "./symbols/StatusSymbols";
import { Table, TableColumn } from "./Table";
import { dateDifferenceDisplay } from "../../helpers/date";
import { Button } from "./interaction/Button";
import { Pill } from "./Pill";

interface StockTableProps {
  stockItems: LineItemWithDetails[];
  onEdit?: (item: LineItemWithDetails) => void;
  onDispose?: (item: LineItemWithDetails) => void;
}

export const StockTable = ({
  stockItems,
  onEdit,
  onDispose,
}: StockTableProps) => {
  const lowInStockThreshold = 10;

  const sortedLineItems = useMemo(() => {
    return [...stockItems].sort((a, b) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const aExpired = a.expiry && new Date(a.expiry) < today;
      const bExpired = b.expiry && new Date(b.expiry) < today;

      if (aExpired && bExpired) {
        return new Date(b.expiry!).getTime() - new Date(a.expiry!).getTime();
      }
      if (aExpired) return 1;
      if (bExpired) return -1;

      // For non-expired items: items with expiry dates first, then no expiry
      if (!a.expiry && !b.expiry) return 0;
      if (!a.expiry) return 1;
      if (!b.expiry) return -1;

      return new Date(a.expiry).getTime() - new Date(b.expiry).getTime();
    });
  }, [stockItems]);

  const columns = useMemo(
    (): TableColumn<LineItemWithDetails>[] => [
      {
        key: "location",
        header: "Location",
        gridCol: "minmax(120px, 0.8fr)",
        render: (item) => <span className="truncate">{item.location}</span>,
      },
      {
        key: "expiry",
        header: "Expiry",
        gridCol: "minmax(160px, 1fr)",
        render: (item) => {
          if (!item.expiry) return <span>-</span>;

          const expiry = new Date(item.expiry);
          const displayText = dateDifferenceDisplay(expiry);
          const dateText = expiry.toLocaleDateString();

          return (
            <span className="truncate">
              {displayText} - {dateText}
            </span>
          );
        },
      },
      {
        key: "quantity",
        header: "Quantity",
        gridCol: "minmax(80px, min-content)",
        align: "right",
        render: (item) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const isExpired = item.expiry && new Date(item.expiry) < today;

          let stockIcon;
          if (isExpired || item.quantity == 0) {
            stockIcon = <OutOfStock />;
          } else if (item.quantity <= lowInStockThreshold) {
            stockIcon = <LowInStock />;
          } else {
            stockIcon = <InStock />;
          }

          return (
            <div className="flex justify-end items-center gap-2">
              <span className="truncate">{item.quantity}</span>
              <span className="flex-shrink-0">{stockIcon}</span>
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        gridCol: "minmax(100px, min-content)",
        render: (item) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const isExpired = item.expiry && new Date(item.expiry) < today;

          if (isExpired || item.quantity == 0) {
            return (
              <Pill
                bgColour="bg-red-700"
                borderColour="border-red-700"
                textColour="text-white"
              >
                Out of Stock
              </Pill>
            );
          } else if (item.quantity <= lowInStockThreshold) {
            return (
              <Pill
                bgColour="bg-sky-300"
                borderColour="border-sky-300"
                textColour="text-white"
              >
                Low Stock
              </Pill>
            );
          } else {
            return (
              <Pill
                bgColour="bg-green-700"
                borderColour="border-green-700"
                textColour="text-white"
              >
                In Stock
              </Pill>
            );
          }
        },
      },
      {
        key: "actions",
        header: "Actions",
        gridCol: "minmax(140px, min-content)",
        render: (item) => (
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="positive"
                onClick={() => onEdit(item)}
                disabled={item.disposed}
              >
                Edit
              </Button>
            )}
            {onDispose && (
              <Button variant="negative" onClick={() => onDispose?.(item)}>
                {item.disposed ? "Undo" : "Dispose"}
              </Button>
            )}
          </div>
        ),
      },
    ],
    [lowInStockThreshold, onEdit, onDispose],
  );

  return (
    <Table
      columns={columns}
      data={sortedLineItems}
      emptyMessage="No inventory items"
    />
  );
};
