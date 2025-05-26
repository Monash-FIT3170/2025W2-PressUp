import { Meteor } from "meteor/meteor";
import React, { useState, useEffect } from "react";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { StockItemWithSupplier } from "./types";
import {
  StockItemsCollection,
  Supplier,
  SuppliersCollection,
  StockItem
} from "/imports/api";
import { StockTable } from "../../components/StockTable";
import { Modal } from "../../components/Modal";
import { AddItemForm } from "../../components/AddItemForm";
import { StockFilter } from "../../components/StockFilter";
import { usePageTitle } from "../../hooks/PageTitleContext";

export const StockPage = () => {
  // Set title
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Inventory Management - Stock");
  }, [setPageTitle]);


  const [filter, setFilter] = useState<
    "all" | "inStock" | "lowInStock" | "outOfStock"
  >("all");
  const [formResetKey, setFormResetKey] = useState(0);

  const isLoadingStockItems = useSubscribe("stockItems.all") === false;
  const isLoadingSuppliers = useSubscribe("suppliers") === false;

  const stockItems: StockItemWithSupplier[] = useTracker(() => {
    // const stockItems = StockItemsCollection.find({}, { sort: { name: 1 }, limit: 10 }).fetch();  // TEMPORARY LIMIT
    const stockItems = StockItemsCollection.find({}, { sort: { name: 1 } }).fetch(); 
    const result = []
    for (let stockItem of stockItems) {
      let supplier : Supplier | null = null;
      if (stockItem.supplier != null) {
        supplier = SuppliersCollection.find({_id: stockItem.supplier}).fetch()[0];
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

  // Modal state
  const [open, setOpen] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<StockItem | null>(null);

  const handleEdit = (item: StockItem) => {
    setEditItem(item); 
    setOpen(true); 
  };

  const handleModalClose = () => {
    setOpen(false);
    setFormResetKey((prev) => prev + 1);
  };

  const handleSuccess = () => handleModalClose();

  const handleDelete = (item: StockItem) => {
    Meteor.call("stockItems.remove", item._id, (error: Meteor.Error | undefined) => {
      if (error) {
        alert("Error deleting item: " + error.reason);
      }
    });
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="grid grid-cols-2">
        <StockFilter filter={filter} onFilterChange={setFilter} />
        <button
          onClick={() => {
            setEditItem(null)
            setOpen(true)
          }}
          className="text-nowrap justify-self-end shadow-lg/20 ease-in-out transition-all duration-300 p-1 m-4 rounded-xl px-3 bg-rose-400 text-white cursor-pointer w-24 right-2 hover:bg-rose-500"
        >
          Add Item
        </button>
      </div>
      <div id="stock" className="flex flex-1 flex-col overflow-auto">
        {isLoadingStockItems || isLoadingSuppliers ? (
          <p className="text-gray-400 p-4">Loading inventory...</p>
        ) : (
          <StockTable 
            stockItems={filteredStockItems} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <AddItemForm key={formResetKey} onSuccess={handleSuccess} onCancel={handleModalClose} item={editItem} />
      </Modal>
    </div>
  );
};
