import React, { useMemo } from "react";
import { StockItemWithSupplier } from "../pages/inventory/types";
import { OutOfStock, InStock, LowInStock } from "./symbols/StatusSymbols";
import { Table, TableColumn } from "./Table";
import { dateDifferenceDisplay } from "../../helpers/date";

interface StockTableProps {
  stockItems: StockItemWithSupplier[];
}

export const StockTable = ({ stockItems }: StockTableProps) => {
  const lowInStockThreshold = 10;

  const columns = useMemo(
    (): TableColumn<StockItemWithSupplier>[] => [
      {
        key: "supplier",
        header: "Supplier",
        gridCol: "1fr",
        render: (item) => (
          <span className="truncate">
            {item.supplier?.name || "No supplier"}
          </span>
        ),
      },
      {
        key: "location",
        header: "Location",
        gridCol: "1fr",
        render: (item) => <span className="truncate">{item.location}</span>,
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
            <div className="flex justify-end items-center gap-2">
              <span className="truncate">{item.quantity}</span>
              <span className="flex-shrink-0">{stockIcon}</span>
            </div>
          );
        },
      },
      {
        key: "expiryDate",
        header: "Expiry",
        gridCol: "min-content",
        render: (item) => {
          if (!item.expiryDate) return <span>-</span>;

          const expiry = new Date(item.expiryDate);
          const displayText = dateDifferenceDisplay(expiry);

          return (
            <span className="truncate" title={expiry.toLocaleDateString()}>
              {displayText}
            </span>
          );
        },
      },
    ],
    [lowInStockThreshold],
  );

  return (
    <Table
      columns={columns}
      data={stockItems}
      emptyMessage="No inventory items"
    />
  );
};
