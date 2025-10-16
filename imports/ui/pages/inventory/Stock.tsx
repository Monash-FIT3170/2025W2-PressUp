import React, { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";

import {
  StockItemsCollection,
  Supplier,
  SuppliersCollection,
} from "/imports/api";
import { AggregateStockTable } from "../../components/AggregateStockTable";
import { Modal } from "../../components/Modal";
import { AddItemForm } from "../../components/AddItemForm";
import { StockFilter } from "../../components/StockFilter";
import { Loading } from "../../components/Loading";

export const StockPage = () => {
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Inventory Management - Stock");
  }, [setPageTitle]);

  const [filter, setFilter] = useState<
    "all" | "inStock" | "lowInStock" | "outOfStock"
  >("all");
  const [formResetKey, setFormResetKey] = useState(0);

  const isLoadingStockItems = useSubscribe("stockItems.all");
  const isLoadingSuppliers = useSubscribe("suppliers");

  const stockItems = useTracker(() => {
    const stockItems = StockItemsCollection.find(
      {},
      { sort: { name: 1 } },
    ).fetch();

    const result = [];
    for (const stockItem of stockItems) {
      let supplier: Supplier | null = null;
      if (stockItem.supplier != null) {
        supplier =
          SuppliersCollection.find(stockItem.supplier).fetch()[0] || null;
      }
      result.push({ ...stockItem, supplier });
    }
    return result;
  });

  // Modal state for adding new items
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);

  const handleModalClose = () => {
    setAddItemModalOpen(false);
    setFormResetKey((prev) => prev + 1);
  };

  const handleSuccess = () => handleModalClose();

  return (
    <div className="flex flex-1 flex-col">
      <div className="grid grid-cols-2">
        <StockFilter filter={filter} onFilterChange={setFilter} />
        <button
          onClick={() => setAddItemModalOpen(true)}
          className="text-nowrap justify-self-end shadow-lg/20 ease-in-out transition-all duration-300 p-1 m-4 rounded-xl px-3 bg-press-up-purple text-white cursor-pointer w-24 right-2 hover:bg-press-up-purple"
        >
          Add Item
        </button>
      </div>
      <div id="stock" className="flex flex-1 flex-col min-h-0">
        {isLoadingStockItems() || isLoadingSuppliers() ? (
          <Loading />
        ) : (
          <AggregateStockTable stockItems={stockItems} filter={filter} />
        )}
      </div>

      <Modal open={addItemModalOpen} onClose={handleModalClose}>
        <AddItemForm
          key={formResetKey}
          onSuccess={handleSuccess}
          onCancel={handleModalClose}
          item={null}
        />
      </Modal>
    </div>
  );
};
