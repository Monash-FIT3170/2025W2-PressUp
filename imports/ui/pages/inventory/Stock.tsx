import React, { useState, useEffect, useMemo } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import {
  StockItemsCollection,
  Supplier,
  SuppliersCollection,
} from "/imports/api";
import { AggregateStockTable } from "../../components/AggregateStockTable";
import { StockTable } from "../../components/StockTable";
import { Modal } from "../../components/Modal";
import { AddItemForm } from "../../components/AddItemForm";
import { StockFilter } from "../../components/StockFilter";
import { Loading } from "../../components/Loading";
import { Button } from "../../components/interaction/Button";
import { ArrowLeft } from "lucide-react";

export const StockPage = () => {
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Inventory Management - Stock");
  }, [setPageTitle]);

  const [filter, setFilter] = useState<
    "all" | "inStock" | "lowInStock" | "outOfStock"
  >("all");
  const [formResetKey, setFormResetKey] = useState(0);
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null);

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

  const filteredStockItems = useMemo(
    () =>
      stockItems.filter((item) =>
        selectedItemName ? item.name === selectedItemName : true,
      ),
    [stockItems, selectedItemName],
  );

  // Modal state for adding new items
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);

  const handleModalClose = () => {
    setAddItemModalOpen(false);
    setFormResetKey((prev) => prev + 1);
  };

  const handleSuccess = () => handleModalClose();

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="grid grid-cols-2">
        {selectedItemName ? (
          <div className="flex items-center gap-4 p-4">
            <Button
              variant="positive"
              onClick={() => setSelectedItemName(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to All Stock
            </Button>
            <h2 className="text-lg">{selectedItemName}</h2>
          </div>
        ) : (
          <StockFilter filter={filter} onFilterChange={setFilter} />
        )}
        <div className="justify-self-end p-4">
          <Button variant="positive" onClick={() => setAddItemModalOpen(true)}>
            Add Item
          </Button>
        </div>
      </div>
      <div id="stock" className="flex flex-1 flex-col min-h-0 h-0">
        {isLoadingStockItems() || isLoadingSuppliers() ? (
          <Loading />
        ) : selectedItemName ? (
          <StockTable stockItems={filteredStockItems} />
        ) : (
          <AggregateStockTable
            stockItems={stockItems}
            filter={filter}
            onItemNameClick={setSelectedItemName}
          />
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
