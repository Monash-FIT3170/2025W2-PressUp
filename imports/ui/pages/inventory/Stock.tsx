import React, { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { StockItemWithSupplier } from "./types";
import {
  StockItemsCollection,
  Supplier,
  SuppliersCollection,
} from "/imports/api";
import { StockTable } from "../../components/StockTable";
import { Modal } from "../../components/Modal";
import { AddItemForm } from "../../components/AddItemForm";
import { StockFilter } from "../../components/StockFilter";

export const StockPage = () => {
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Inventory Management - Stock");
  }, [setPageTitle]);

  const [filter, setFilter] = useState<
    "all" | "inStock" | "lowInStock" | "outOfStock"
  >("all");
  const [open, setOpen] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);

  const isLoadingStockItems = useSubscribe("stockItems.all") === false;
  const isLoadingSuppliers = useSubscribe("suppliers") === false;

  const stockItems: StockItemWithSupplier[] = useTracker(() => {
    const stockItems = StockItemsCollection.find({}, { sort: { name: 1 } }).fetch();
    const result = []
    console.log(stockItems);
    for (let stockItem of stockItems) {
      let supplier : Supplier | null = null;
      if (stockItem.supplier != null) {
        supplier = SuppliersCollection.find({_id: stockItem.supplier}).fetch()[0];
        console.log(supplier)
      }
      result.push({...stockItem, supplier});
    }
    return result
  });

  const lowStockThreshold = 10;
  const filteredStockItems = stockItems.filter((item) => {
    if (filter === "inStock") return item.quantity > lowStockThreshold;
    if (filter === "outOfStock") return item.quantity === 0;
    if (filter === "lowInStock")
      return item.quantity > 0 && item.quantity <= lowStockThreshold;
    return true;
  });

  const handleModalClose = () => {
    setOpen(false);
    setFormResetKey((prev) => prev + 1);
  };

  const handleSuccess = () => handleModalClose();

  return (
    <div className="flex flex-1 flex-col">
      <div className="grid grid-cols-2">
        <StockFilter filter={filter} onFilterChange={setFilter} />
        <button
          onClick={() => setOpen(true)}
          className="text-nowrap justify-self-end shadow-lg/20 ease-in-out transition-all duration-300 p-1 m-4 rounded-xl px-3 bg-press-up-purple text-white cursor-pointer w-24 right-2 hover:bg-press-up-purple"
        >
          Add Item
        </button>
      </div>
      <div id="stock" className="flex flex-1 flex-col overflow-auto">
        {isLoadingStockItems || isLoadingSuppliers ? (
          <p className="text-gray-400 p-4">Loading inventory...</p>
        ) : (
          <StockTable stockItems={filteredStockItems} />
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <AddItemForm key={formResetKey} onSuccess={handleSuccess} />
      </Modal>
    </div>
  );
};
