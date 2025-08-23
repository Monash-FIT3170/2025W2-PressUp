import React, { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { Supplier, SuppliersCollection } from "/imports/api";
import { Modal } from "../../components/Modal";
import { AddSupplierForm } from "../../components/AddSupplierForm";
import { SearchBar } from "../../components/SearchBar";
import { SupplierTable } from "../../components/SupplierTable";
import { ConfirmModal } from "../../components/ConfirmModal";

export const SuppliersPage = () => {
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Inventory Management - Suppliers");
  }, [setPageTitle]);

  const [open, setOpen] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirm, setConfirm] = useState<"cancel" | "delete" | null>(null);

  const isLoadingSuppliers = useSubscribe("suppliers");
  const suppliers: Supplier[] = useTracker(() => {
    return SuppliersCollection.find({}, { sort: { name: 1 } }).fetch();
  });

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      searchTerm === "" ||
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.goods &&
        supplier.goods.some((good) =>
          good.toLowerCase().includes(searchTerm.toLowerCase()),
        )),
  );

  const handleModalClose = () => {
    setOpen(false);
    setFormResetKey((prev) => prev + 1);
  };

  const handleSuccess = () => handleModalClose();

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex justify-between items-center p-4 gap-2">
        <div className="relative w-full">
          <SearchBar onSearch={setSearchTerm} initialSearchTerm={searchTerm} />
        </div>
        <button
          onClick={() => setOpen(true)}
          className="text-nowrap justify-self-end shadow-lg/20 ease-in-out transition-all duration-300 p-1 m-4 ml-auto rounded-xl px-3 bg-press-up-purple text-white cursor-pointer w-right-2 hover:bg-press-up-purple"
        >
          Add Supplier
        </button>
      </div>

      <div
        id="supplier-container"
        className="flex flex-1 flex-col overflow-auto"
      >
        {isLoadingSuppliers() ? (
          <p className="text-gray-400 p-4">Loading suppliers...</p>
        ) : (
          <SupplierTable suppliers={filteredSuppliers} />
        )}
      </div>

      <Modal
        open={open}
        onClose={() => {
          setConfirm("cancel");
          setShowConfirmation(true);
        }}
      >
        <AddSupplierForm key={formResetKey} onSuccess={handleSuccess} />
      </Modal>
      <ConfirmModal
        open={showConfirmation}
        message={
          confirm === "cancel"
            ? "Are you sure you want to discard your changes?"
            : "Are you sure you want to delete this item?"
        }
        onConfirm={() => {
          if (confirm === "cancel") {
            handleModalClose();
          }
          //  else if (confirm === "delete") {
          //   handleDelete();
          // }
          setShowConfirmation(false);
          setConfirm(null);
        }}
        onCancel={() => {
          setShowConfirmation(false);
          setConfirm(null);
        }}
      />
    </div>
  );
};
