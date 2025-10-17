import React, { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { Supplier, SuppliersCollection } from "/imports/api";
import { Modal } from "../../components/Modal";
import { AddSupplierForm } from "../../components/AddSupplierForm";
import { SearchBar } from "../../components/SearchBar";
import { SupplierTable } from "../../components/SupplierTable";
import { SupplierInfo } from "../../components/SupplierInfo";
import { ConfirmModal } from "../../components/ConfirmModal";
import { Button } from "../../components/interaction/Button";
import { Loading } from "../../components/Loading";

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
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );

  const isLoadingSuppliers = useSubscribe("suppliers");
  const isLoadingStockItems = useSubscribe("stockItems.all");
  const suppliers: Supplier[] = useTracker(() => {
    return SuppliersCollection.find({}, { sort: { name: 1 } }).fetch();
  });

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      searchTerm === "" ||
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleModalClose = () => {
    setOpen(false);
    setFormResetKey((prev) => prev + 1);
  };

  const handleSuccess = () => handleModalClose();

  const handleSupplierClick = (supplier: Supplier) => {
    setSelectedSupplier((x) => (x?._id === supplier._id ? null : supplier));
  };

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="flex justify-between items-center p-4 gap-2">
        <div className="relative w-full">
          <SearchBar onSearch={setSearchTerm} initialSearchTerm={searchTerm} />
        </div>
        <Button variant="positive" onClick={() => setOpen(true)}>
          Add Supplier
        </Button>
      </div>

      <div className="flex flex-1 flex-col min-h-0">
        <div className={`min-h-0 ${selectedSupplier ? "flex-1" : "flex-1"}`}>
          {isLoadingSuppliers() || isLoadingStockItems() ? (
            <Loading />
          ) : (
            <SupplierTable
              suppliers={filteredSuppliers}
              onSupplierClick={handleSupplierClick}
            />
          )}
        </div>

        {selectedSupplier && (
          <div className="flex-1 border-t-2 border-gray-300 bg-white overflow-hidden">
            <SupplierInfo supplier={selectedSupplier} />
          </div>
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
