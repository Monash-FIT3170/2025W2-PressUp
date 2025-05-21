import React, { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { Supplier, SuppliersCollection } from "/imports/api";
import { SupplierTable } from "../../components/SupplierTable";
import { Modal } from "../../components/Modal";
import { AddItemForm } from "../../components/AddItemForm";

export const SuppliersPage = () => {
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Inventory Management - Suppliers");
  }, [setPageTitle]);

  const [open, setOpen] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);

  const isLoadingSuppliers = useSubscribe("suppliers") === false;

  const suppliers: Supplier[] = useTracker(() => {
    const suppliers = SuppliersCollection.find(
      {},
      { sort: { name: 1 } },
    ).fetch();
    const result = [];
    console.log(suppliers);
    for (let supplier of suppliers) {
      result.push({ ...supplier });
    }
    return result;
  });

  const handleModalClose = () => {
    setOpen(false);
    setFormResetKey((prev) => prev + 1);
  };

  const handleSuccess = () => handleModalClose();

  return (
    <div className="flex flex-1 flex-col">
      <button
        onClick={() => setOpen(true)}
        className="text-nowrap justify-self-end shadow-lg/20 ease-in-out transition-all duration-300 p-1 m-4 ml-auto rounded-xl px-3 bg-rose-400 text-white cursor-pointer w-right-2 hover:bg-rose-500"
      >
        Add Supplier
      </button>
      <div id="stock" className="flex flex-1 flex-col overflow-auto">
        {isLoadingSuppliers ? (
          <p className="text-gray-400 p-4">Loading inventory...</p>
        ) : (
          <SupplierTable suppliers={suppliers} />
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <AddItemForm key={formResetKey} onSuccess={handleSuccess} /> /*TODO:
        change to add supplier form */
      </Modal>
    </div>
  );
};
