import React from "react";
import { StockItemWithSupplier, StockItem } from "../pages/inventory/types";
import { Pill } from "./Pill";
import { OutOfStock, InStock, LowInStock } from "./symbols/StatusSymbols";
import { Table, TableColumn } from "./Table";
import { Button } from "./interaction/Button";

interface StockTableProps {
  stockItems: StockItemWithSupplier[];
  onEdit: (item: StockItem) => void;
  onDelete: (item: StockItem) => void;
}

export const StockTable = ({
  stockItems,
  onEdit,
  onDelete,
}: StockTableProps) => {
  const lowInStockThreshold = 10;

  const columns: TableColumn<StockItemWithSupplier>[] = [
    {
      key: "name",
      header: "Item Name",
      gridCol: "minmax(0,2fr)",
      align: "left",
      render: (item) => <span className="truncate">{item.name}</span>,
    },
    {
      key: "quantity",
      header: "Quantity",
      gridCol: "min-content",
      align: "right",
      render: (item) => {
        const stockIcon =
          item.quantity == 0 ? (
            <OutOfStock />
          ) : item.quantity <= lowInStockThreshold ? (
            <LowInStock />
          ) : (
            <InStock />
          );

        return (
          <div className="flex justify-end">
            <span className="truncate max-w-full px-1">{item.quantity}</span>
            <span className="flex-shrink-0 self-center">{stockIcon}</span>
          </div>
        );
      },
    },
    {
      key: "location",
      header: "Stock Room",
      gridCol: "1fr",
      render: (item) => <span className="truncate">{item.location}</span>,
    },
    {
      key: "status",
      header: "Status",
      gridCol: "min-content",
      render: (item) => {
        if (item.quantity == 0) {
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
      key: "supplier",
      header: "Supplier",
      gridCol: "1fr",
      render: (item) => <span className="truncate">{item.supplier?.name}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      gridCol: "min-content",
      render: (item) => (
        <div className="flex gap-2 justify-center items-center">
          <Button
            variant="positive"
            onClick={() =>
              onEdit({ ...item, supplier: item.supplier?._id ?? null })
            }
          >
            Edit
          </Button>
          <Button
            variant="negative"
            onClick={() =>
              onDelete({ ...item, supplier: item.supplier?._id ?? null })
            }
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={stockItems}
      emptyMessage="No inventory items"
    />
  );
};
