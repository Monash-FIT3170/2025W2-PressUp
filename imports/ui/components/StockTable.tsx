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

  const sortedStockItems = useMemo(() => {
    return [...stockItems].sort((a, b) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const aExpired = a.expiryDate && new Date(a.expiryDate) < today;
      const bExpired = b.expiryDate && new Date(b.expiryDate) < today;

      if (aExpired && bExpired) {
        return (
          new Date(b.expiryDate!).getTime() - new Date(a.expiryDate!).getTime()
        );
      }
      if (aExpired) return 1;
      if (bExpired) return -1;

      // For non-expired items: items with expiry dates first, then no expiry
      if (!a.expiryDate && !b.expiryDate) return 0;
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;

      return (
        new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      );
    });
  }, [stockItems]);

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
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Start of today
          const isExpired =
            item.expiryDate && new Date(item.expiryDate) < today;

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
      data={sortedStockItems}
      emptyMessage="No inventory items"
    />
  );
};
