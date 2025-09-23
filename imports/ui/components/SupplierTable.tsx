import React, { useState } from "react";
import { Supplier } from "/imports/api/suppliers/SuppliersCollection";
import { StockItemsCollection } from "/imports/api/stockItems/StockItemsCollection";
import { PurchaseOrdersCollection } from "/imports/api/purchaseOrders/PurchaseOrdersCollection";
import { InfoSymbol, Cross } from "./symbols/GeneralSymbols";
import { Modal } from "./Modal";
import { PurchaseOrderForm } from "./PurchaseOrderForm";
import { Table, TableColumn } from "./Table";
import { Button } from "./interaction/Button";
import { Meteor } from "meteor/meteor";
import { IdType } from "/imports/api/database";
import { useTracker, useSubscribe } from "meteor/react-meteor-data";

interface SupplierTableProps {
  suppliers: Supplier[];
  onSupplierClick: (supplier: Supplier) => void;
}

export const SupplierTable = ({
  suppliers,
  onSupplierClick,
}: SupplierTableProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [purchaseOrderId, setPurchaseOrderId] = useState<IdType | null>(null);

  const stockItems = useTracker(() => {
    return StockItemsCollection.find({}, { sort: { name: 1 } }).fetch();
  }, []);

  useSubscribe("purchaseOrders");
  const purchaseOrderCounts = useTracker(() => {
    const counts = new Map();
    suppliers.forEach((supplier) => {
      const count = PurchaseOrdersCollection.find({
        supplier: supplier._id,
      }).count();
      counts.set(supplier._id, count);
    });
    return counts;
  }, [suppliers]);

  const onCreatePurchaseOrder = (supplier: Supplier) => {
    Meteor.call(
      "purchaseOrders.new",
      { supplierId: supplier._id },
      (err: Meteor.Error | undefined, result: IdType) => {
        if (err) {
          console.error(err.reason);
        } else {
          setPurchaseOrderId(result);
          setIsOpen(true);
        }
      },
    );
  };

  const removeItemFromSupplier = (itemId: IdType) => {
    if (
      confirm("Are you sure you want to remove this item from the supplier?")
    ) {
      Meteor.call(
        "stockItems.removeFromSupplier",
        itemId,
        (err: Meteor.Error | undefined) => {
          if (err) {
            console.error("Error removing item from supplier:", err.reason);
            alert("Error removing item from supplier: " + err.reason);
          } else {
            console.log("Item successfully removed from supplier");
          }
        },
      );
    }
  };

  const columns: TableColumn<Supplier>[] = [
    {
      key: "name",
      header: "Supplier Name",
      gridCol: "2fr",
      align: "left",
      render: (supplier) => (
        <div className="flex items-center">
          <span className="truncate max-w-full px-1">{supplier.name}</span>
          <button
            className="flex-shrink-0 ml-auto cursor-pointer"
            onClick={() => onSupplierClick(supplier)}
          >
            <InfoSymbol fill="#E76573" viewBox="0 0 24 24" />
          </button>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      gridCol: "2fr",
      render: (supplier) => (
        <div className="text-left">
          <a
            href={`mailto:${supplier.email}`}
            className="text-blue-600 hover:underline block truncate"
          >
            {supplier.email}
          </a>
          <div className="text-sm text-gray-600 truncate">{supplier.phone}</div>
        </div>
      ),
    },
    {
      key: "stockItems",
      header: "Stock Items",
      gridCol: "2fr",
      render: (supplier) => {
        const supplierItems = stockItems.filter(
          (item) => item.supplier === supplier._id,
        );
        return (
          <div className="flex flex-wrap gap-1">
            {supplierItems.map((item, itemIndex) => (
              <span
                key={itemIndex}
                className="bg-press-up-purple text-white rounded-sm text-xs px-2 py-1 inline-flex items-center"
              >
                {item.name}
                <button
                  className="ml-2 cursor-pointer hover:bg-red-600 rounded-full p-1 transition-colors flex items-center justify-center"
                  onClick={() => removeItemFromSupplier(item._id)}
                  title="Remove from supplier"
                  style={{ width: "16px", height: "16px" }}
                >
                  <Cross height="8px" width="8px" viewBox="0 0 14 14" />
                </button>
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "pastOrders",
      header: "Past Orders",
      gridCol: "min-content",
      render: (supplier) => (
        <span>{purchaseOrderCounts.get(supplier._id) || 0}</span>
      ),
    },
    {
      key: "actions",
      header: "PO",
      gridCol: "min-content",
      render: (supplier) => (
        <Button
          variant="positive"
          onClick={() => onCreatePurchaseOrder(supplier)}
        >
          Create PO
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Table
        columns={columns}
        data={suppliers}
        emptyMessage="No suppliers found."
      />

      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        {isOpen && (
          <PurchaseOrderForm purchaseOrderId={purchaseOrderId ?? ""} />
        )}
      </Modal>
    </div>
  );
};
