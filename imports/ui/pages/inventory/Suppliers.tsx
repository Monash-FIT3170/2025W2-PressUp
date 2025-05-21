import React, { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { Supplier, SuppliersCollection } from "/imports/api";
import { Modal } from "../../components/Modal";
import { AddSupplierForm } from "../../components/AddSupplierForm";
import { Search } from 'lucide-react'; 
import { SupplierTable } from "../../components/SupplierTable";

export const SuppliersPage = () => {
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Inventory Management - Suppliers");
  }, [setPageTitle]);

  const [open, setOpen] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  
  const isLoadingSuppliers = useSubscribe("suppliers") === false;
  
  const suppliers: Supplier[] = useTracker(() => {
    return SuppliersCollection.find({}, { sort: { name: 1 } }).fetch();
  });

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(supplier => 
    searchTerm === "" || 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.goods && supplier.goods.some(good => 
      good.toLowerCase().includes(searchTerm.toLowerCase())
    ))
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
          <input
            type="text"
            placeholder="Search suppliers or goods"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-70 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <button
          onClick={() => setOpen(true)}
          className="text-nowrap justify-self-end shadow-lg/20 ease-in-out transition-all duration-300 p-1 m-4 ml-auto rounded-xl px-3 bg-rose-400 text-white cursor-pointer w-right-2 hover:bg-rose-500"
        >
          Add Supplier
        </button>
      </div>
      
      <div id="supplier-container" className="flex flex-1 flex-col overflow-auto">
        {isLoadingSuppliers ? (
          <p className="text-gray-400 p-4">Loading suppliers...</p>
        ) : (
          <SupplierTable suppliers={filteredSuppliers} />

        )}
      </div>
      
      <Modal open={open} onClose={() => setOpen(false)}>
        <AddSupplierForm key={formResetKey} onSuccess={handleSuccess} />
      </Modal>
    </div>
  );
};