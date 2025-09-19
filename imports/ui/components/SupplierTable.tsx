import React, { useState } from "react";
import { Supplier } from "/imports/api/suppliers/SuppliersCollection";
import { StockItemsCollection } from "/imports/api/stockItems/StockItemsCollection";
import { PurchaseOrdersCollection } from "/imports/api/purchaseOrders/PurchaseOrdersCollection";
import { InfoSymbol, Cross } from "./symbols/GeneralSymbols";
import { SupplierInfo } from "./SupplierInfo";
import { Modal } from "./Modal";
import { PurchaseOrderForm } from "./PurchaseOrderForm";
import { Meteor } from "meteor/meteor";
import { IdType } from "/imports/api/database";
import { useTracker, useSubscribe } from "meteor/react-meteor-data";

interface SupplierTableProps {
  suppliers: Supplier[];
}

export const SupplierTable = ({ suppliers }: SupplierTableProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSupplierId, setExpandedSupplierId] = useState<IdType | null>(
    null,
  );
  const [purchaseOrderId, setPurchaseOrderId] = useState<IdType | null>(null);

  // Fetch stock items for all suppliers
  const stockItems = useTracker(() => {
    return StockItemsCollection.find({}, { sort: { name: 1 } }).fetch();
  }, []);

  // Calculate purchase order counts for each supplier
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

  const toggleExpanded = (supplierId: string) => {
    setExpandedSupplierId(
      expandedSupplierId === supplierId ? null : supplierId,
    );
  };

  if (suppliers.length === 0)
    return (
      <h2 className="flex-1 text-center font-bold text-xl text-red-900">
        No suppliers found.
      </h2>
    );

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

  return (
    <div id="grid-container" className="overflow-auto flex-1">
      <div className="grid gap-y-2 text-nowrap text-center grid-cols-15 text-red-900">
        <div className="col-span-4 bg-press-up-light-purple py-1 px-2 border-y-3 border-press-up-light-purple rounded-l-lg sticky top-0 z-1 text-left">
          Supplier Name
          <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
        </div>
        <div className="col-span-4 bg-press-up-light-purple py-1 px-2 border-y-3 border-press-up-light-purple sticky top-0 z-1">
          Contact
          <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
        </div>
        <div className="col-span-3 bg-press-up-light-purple py-1 px-2 border-y-3 border-press-up-light-purple sticky top-0 z-1">
          Stock Items
          <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
        </div>
        <div className="col-span-2 bg-press-up-light-purple py-1 px-2 border-y-3 border-press-up-light-purple sticky top-0 z-1">
          Past Orders
          <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
        </div>
        <div className="col-span-2 bg-press-up-light-purple py-1 px-2 border-y-3 border-press-up-light-purple rounded-r-lg sticky top-0 z-1">
          PO
        </div>
        {suppliers.map((supplier, i) => {
          const supplierId = supplier._id?.toString() || i.toString();
          return (
            <React.Fragment key={supplierId}>
              <div className="col-span-4 text-left truncate relative py-1 px-2 flex items-center">
                <span className="truncate max-w-full px-1">
                  {supplier.name}
                </span>
                <span
                  className="flex-shrink-0 ml-auto cursor-pointer"
                  onClick={() => toggleExpanded(supplierId)}
                >
                  <InfoSymbol fill="#E76573" viewBox="0 0 24 24" />
                </span>
                <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
              </div>
              <div className="col-span-4 truncate relative py-1 px-2">
                <div className="grid-rows-2">
                  <div>
                    <a
                      href={`mailto:${supplier.email}`}
                      className="text-blue-600 dark:text-blue-500 hover:underline"
                    >
                      {supplier.email}
                    </a>
                    <div>{supplier.phone}</div>
                  </div>
                  <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
                </div>

                <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
              </div>
              <div className="col-span-3 flex flex-wrap relative py-1 px-2">
                {stockItems
                  .filter((item) => item.supplier === supplier._id)
                  .map((item, itemIndex) => (
                    <span
                      key={itemIndex}
                      className="bg-press-up-purple border-press-up-light-purple text-white rounded-sm text-xs m-1 w-max h-max px-2 py-1 inline-flex items-center"
                    >
                      {item.name}
                      <span
                        className="ml-2 cursor-pointer hover:bg-red-600 rounded-full p-1 transition-colors flex items-center justify-center"
                        onClick={() => removeItemFromSupplier(item._id)}
                        title="Remove from supplier"
                        style={{ width: "20px", height: "20px" }}
                      >
                        <Cross height="8px" width="8px" viewBox="0 0 14 14" />
                      </span>
                    </span>
                  ))}
                <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-8" />
              </div>
              <div className="col-span-2 relative py-1 px-2 flex items-center justify-center">
                {purchaseOrderCounts.get(supplier._id) || 0}
                <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
              </div>
              <div className="col-span-2 truncate py-1 px-2 flex items-center justify-center">
                <button
                  className="bg-press-up-positive-button rounded-4xl text-white px-4 p-2 cursor-pointer"
                  onClick={() => onCreatePurchaseOrder(supplier)}
                >
                  Create PO
                </button>
              </div>

              {/* Expandable Supplier Info */}
              {expandedSupplierId === supplier._id?.toString() && (
                <div className="col-span-15">
                  <SupplierInfo
                    supplier={supplier}
                    isExpanded={true}
                    onToggle={() =>
                      toggleExpanded(supplier._id?.toString() || "")
                    }
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        {isOpen && (
          <PurchaseOrderForm purchaseOrderId={purchaseOrderId ?? ""} />
        )}
      </Modal>
    </div>
  );
};
