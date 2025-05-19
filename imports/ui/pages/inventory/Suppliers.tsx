import React, { useState } from "react";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { StockItemWithSupplier } from "./types";
import {
  StockItemsCollection,
  Supplier,
  SuppliersCollection,
} from "/imports/api";
import { SupplierTable } from "../../components/SupplierTable";
import { Modal } from "../../components/Modal";
import { AddSupplierForm } from "../../components/AddSupplierForm";


export const SuppliersPage = () => {
  const [open, setOpen] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);

  const isLoadingSuppliers = useSubscribe("suppliers") === false;

  const suppliers: Supplier[] = useTracker(() => {
    return SuppliersCollection.find({}, { sort: { name: 1 } }).fetch();
  })

  const handleModalClose = () => {
    setOpen(false);
    setFormResetKey((prev) => prev + 1);
  };

  const handleSuccess = () => handleModalClose();


  const stockItems: StockItemWithSupplier[] = useTracker(() => {
    const stockItems = StockItemsCollection.find(
      {},
      { sort: { name: 1 } },
    ).fetch();
    const result = [];
    console.log(stockItems);
    for (let stockItem of stockItems) {
      let supplier: Supplier | null = null;
      if (stockItem.supplier != null) {
        supplier = SuppliersCollection.find({
          _id: stockItem.supplier,
        }).fetch()[0];
        console.log(supplier);
      }
      result.push({ ...stockItem, supplier });
    }
    return result;
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="grid grid-cols-2">
        <button
          onClick={() => setOpen(true)}
          className="text-nowrap justify-self-end shadow-lg/20 ease-in-out transition-all duration-300 p-1 m-4 rounded-xl px-3 bg-rose-400 text-white cursor-pointer w-30 right-2 hover:bg-rose-500"
        >
          Add Supplier
        </button>
      </div>
      <div id="stock" className="flex flex-1 flex-col overflow-auto">
        {isLoadingStockItems || isLoadingSuppliers ? (
          <p className="text-gray-400 p-4">Loading inventory...</p>
        ) : (
          <SupplierTable suppliers={suppliers} />
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <AddSupplierForm key={formResetKey} onSuccess={handleSuccess} /> 
      </Modal>
    </div>
  );
};
