import React from "react";
import { Supplier } from "/imports/api/suppliers/SuppliersCollection";
import { StockItemsCollection } from "/imports/api/stockItems/StockItemsCollection";
import { PurchaseOrdersCollection } from "/imports/api/purchaseOrders/PurchaseOrdersCollection";
import { useTracker, useSubscribe } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { IdType } from "/imports/api/database";
import { Cross } from "./symbols/GeneralSymbols";
import { Table } from "./Table";

interface SupplierInfoProps {
  supplier: Supplier;
}

export const SupplierInfo = ({ supplier }: SupplierInfoProps) => {
  // Fetch stock items for this supplier
  const stockItems = useTracker(() => {
    return StockItemsCollection.find(
      { supplier: supplier._id },
      { sort: { name: 1 } },
    ).fetch();
  }, [supplier._id]);

  useSubscribe("purchaseOrders");
  const purchaseOrders = useTracker(() => {
    const purchaseOrders = PurchaseOrdersCollection.find(
      { supplier: supplier._id },
      { sort: { date: -1 } },
    ).fetch();

    const stockItemsMap = new Map(
      StockItemsCollection.find()
        .fetch()
        .map((item) => [item._id, item.name]),
    );

    return purchaseOrders.flatMap((purchaseOrder) => {
      return purchaseOrder.stockItems.map((stockItemLine) => {
        const stockItemName =
          stockItemsMap.get(stockItemLine.stockItem) || "Unknown Item";

        return {
          number: purchaseOrder.number,
          date: purchaseOrder.date,
          stockItemName: stockItemName,
          quantity: stockItemLine.quantity,
          totalCost: stockItemLine.cost * stockItemLine.quantity,
        };
      });
    });
  }, [supplier._id]);

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

  if (!supplier) return null;
  if (!supplier.name) return null;
  if (!supplier.email) return null;
  if (!supplier.phone) return null;
  if (!supplier.address) supplier.address = "";
  if (!supplier.website) supplier.website = "";

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-4 flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-300 pb-2">
          {supplier.name}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-3 flex-1 min-h-0">
        {/* Contact Information */}
        <div className="bg-white p-4 rounded-lg shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2 underline">
            Contact
          </h3>
          <div className="space-y-2 text-sm text-left">
            <div>
              <span className="font-medium text-gray-600">Email:</span>
              <a
                href={`mailto:${supplier.email}`}
                className="ml-2 text-blue-600 hover:underline"
              >
                {supplier.email}
              </a>
            </div>
            <div>
              <span className="font-medium text-gray-600">Phone:</span>
              <span className="ml-2 text-gray-800">{supplier.phone}</span>
            </div>
            <div>
              {supplier.website && (
                <div className="mb-2">
                  <span className="font-medium text-gray-600">Website:</span>
                  <a
                    href={supplier.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    {supplier.website}
                  </a>
                </div>
              )}
              {supplier.address && (
                <div>
                  <span className="font-medium text-gray-600">Address:</span>
                  <span className="ml-2 text-gray-800">{supplier.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Supplier Goods */}
        <div className="bg-white p-4 rounded-lg shadow-sm lg:col-span-1 flex flex-col min-h-0">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2 underline flex-shrink-0">
            Stock Items
          </h3>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ul className="space-y-1 text-sm">
              {stockItems.length > 0 ? (
                stockItems.map((item, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <div className="flex items-center overflow-hidden w-full">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 shrink-0"></span>
                      <span className="text-gray-800 truncate">
                        {item.name}
                      </span>
                    </div>
                    <button
                      onClick={() => removeItemFromSupplier(item._id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full p-1 transition-colors"
                      title="Remove from supplier"
                    >
                      <Cross height="12px" width="12px" viewBox="0 0 14 14" />
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 italic">No stock items found</li>
              )}
            </ul>
          </div>
        </div>

        {/* Order History */}
        <div className="bg-white p-4 rounded-lg shadow-sm lg:col-span-3 flex flex-col min-h-0">
          <h3 className="text-lg font-semibold text-gray-700 underline border-b border-gray-200 mb-3 pb-2 flex-shrink-0">
            Order History
          </h3>

          <div className="flex-1 min-h-0 flex flex-col">
            <Table
              columns={[
                {
                  key: "number",
                  header: "No.",
                  gridCol: "min-content",
                  align: "left",
                  render: (order) => <span>{order.number}</span>,
                },
                {
                  key: "date",
                  header: "Date",
                  gridCol: "min-content",
                  align: "left",
                  render: (order) => (
                    <span>{order.date.toLocaleDateString()}</span>
                  ),
                },
                {
                  key: "stockItem",
                  header: "Stock Item",
                  gridCol: "1fr",
                  align: "left",
                  render: (order) => (
                    <span className="truncate">{order.stockItemName}</span>
                  ),
                },
                {
                  key: "quantity",
                  header: "Quantity",
                  gridCol: "min-content",
                  align: "left",
                  render: (order) => <span>{order.quantity}</span>,
                },
                {
                  key: "totalCost",
                  header: (
                    <>
                      Total Cost <span className="text-xs">(Inc GST)</span>
                    </>
                  ),
                  gridCol: "min-content",
                  align: "left",
                  render: (order) => <span>${order.totalCost.toFixed(2)}</span>,
                },
              ]}
              data={purchaseOrders}
              emptyMessage="No purchase orders found for this supplier"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
