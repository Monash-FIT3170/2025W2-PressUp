import React, { useMemo } from "react";
import {
  StockItemWithSupplier,
  AggregatedStockItem,
} from "../pages/inventory/types";
import { Pill } from "./Pill";
import { OutOfStock, InStock, LowInStock } from "./symbols/StatusSymbols";
import { Table, TableColumn } from "./Table";
import { Button } from "./interaction/Button";

interface AggregateStockTableProps {
  stockItems: StockItemWithSupplier[];
  filter?: "all" | "inStock" | "lowInStock" | "outOfStock";
  onItemNameClick?: (stockItemId: string) => void;
  onEditItem?: (stockItem: StockItemWithSupplier) => void;
}

export const AggregateStockTable = ({
  stockItems,
  filter = "all",
  onItemNameClick,
  onEditItem,
}: AggregateStockTableProps) => {
  const lowInStockThreshold = 10;

  const aggregatedItems = useMemo(() => {
    const result = [];
    for (const stockItem of stockItems) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Total quantity excludes expired line items
      let totalQuantity = 0;
      const totalLineItems = stockItem.lineItems.length;

      for (const lineItem of stockItem.lineItems) {
        const isExpired = lineItem.expiry && new Date(lineItem.expiry) < today;
        if (!isExpired) {
          totalQuantity += lineItem.quantity;
        }
      }

      result.push({
        name: stockItem.name,
        supplier: stockItem.supplier,
        stockItemId: stockItem._id,
        totalQuantity,
        itemCount: totalLineItems,
      });
    }

    // Filter aggregated results
    return result.filter((item) => {
      if (filter === "inStock") return item.totalQuantity > lowInStockThreshold;
      if (filter === "outOfStock") return item.totalQuantity === 0;
      if (filter === "lowInStock")
        return (
          item.totalQuantity > 0 && item.totalQuantity <= lowInStockThreshold
        );
      return true;
    });
  }, [stockItems, filter]);

  const columns = useMemo(
    (): TableColumn<AggregatedStockItem>[] => [
      {
        key: "name",
        header: "Item Name",
        gridCol: "minmax(0,1fr)",
        align: "left",
        render: (item) => (
          <span
            className="truncate cursor-pointer hover:text-blue-600 underline decoration-2 underline-offset-2"
            onClick={() => onItemNameClick?.(item.stockItemId)}
            title="Click to view details"
          >
            {item.name}
          </span>
        ),
      },
      {
        key: "supplier",
        header: "Supplier",
        gridCol: "minmax(0,1fr)",
        align: "left",
        render: (item) => (
          <span className="truncate">
            {item.supplier?.name || "No supplier"}
          </span>
        ),
      },
      {
        key: "itemCount",
        header: "Line Items",
        gridCol: "min-content",
        render: (item) => <span className="truncate">{item.itemCount}</span>,
      },
      {
        key: "quantity",
        header: "Total Quantity",
        gridCol: "min-content",
        align: "right",
        render: (item) => {
          const stockIcon =
            item.totalQuantity == 0 ? (
              <OutOfStock />
            ) : item.totalQuantity <= lowInStockThreshold ? (
              <LowInStock />
            ) : (
              <InStock />
            );

          return (
            <div className="flex justify-end">
              <span className="truncate max-w-full px-1">
                {item.totalQuantity}
              </span>
              <span className="flex-shrink-0 self-center">{stockIcon}</span>
            </div>
          );
        },
      },

      {
        key: "status",
        header: "Status",
        gridCol: "min-content",
        render: (item) => {
          if (item.totalQuantity == 0) {
            return (
              <Pill
                bgColour="bg-red-700"
                borderColour="border-red-700"
                textColour="text-white"
              >
                Out of Stock
              </Pill>
            );
          } else if (item.totalQuantity <= lowInStockThreshold) {
            return (
              <Pill
                bgColour="bg-sky-300"
                borderColour="border-sky-300"
                textColour="text-white"
              >
                Low in Stock
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
        gridCol: "min-content",
        render: (item) => {
          const stockItem = stockItems.find(
            (si) => si._id === item.stockItemId,
          );
          return (
            <div className="flex gap-2">
              <Button
                variant="positive"
                onClick={() => stockItem && onEditItem?.(stockItem)}
              >
                Edit
              </Button>
            </div>
          );
        },
      },
    ],
    [onItemNameClick, onEditItem, lowInStockThreshold, stockItems],
  );

  return (
    <Table
      columns={columns}
      data={aggregatedItems}
      emptyMessage="No inventory items"
    />
  );
};
