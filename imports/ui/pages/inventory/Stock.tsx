import React, { useState, useEffect, useMemo } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { StockItemsCollection, SuppliersCollection } from "/imports/api";
import { StockItemWithSupplier, LineItemWithDetails } from "./types";
import { AggregateStockTable } from "../../components/AggregateStockTable";
import { StockTable } from "../../components/StockTable";
import { Modal } from "../../components/Modal";
import { AddStockItemForm } from "../../components/AddStockItemForm";
import { EditLineItemForm } from "../../components/EditLineItemForm";
import { EditStockItemNameModal } from "../../components/EditStockItemNameModal";
import { StockFilter } from "../../components/StockFilter";
import { Loading } from "../../components/Loading";
import { Button } from "../../components/interaction/Button";
import { ConfirmModal } from "../../components/ConfirmModal";
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
  const [selectedStockItemId, setSelectedStockItemId] = useState<string | null>(
    null,
  );

  const isLoadingStockItems = useSubscribe("stockItems.all");
  const isLoadingSuppliers = useSubscribe("suppliers");

  const stockItems = useTracker(() => {
    const stockItems = StockItemsCollection.find(
      {},
      { sort: { name: 1 } },
    ).fetch();

    const result = [];
    for (const stockItem of stockItems) {
      const supplier = stockItem.supplier
        ? SuppliersCollection.find(stockItem.supplier).fetch()[0] || null
        : null;
      result.push({ ...stockItem, supplier });
    }
    return result;
  });

  // Flatten line items for sub-table
  const lineItems = useMemo(() => {
    const result = [];
    for (const stockItem of stockItems) {
      for (const lineItem of stockItem.lineItems) {
        result.push({
          ...lineItem,
          stockItemId: stockItem._id,
          stockItemName: stockItem.name,
          supplier: stockItem.supplier,
        });
      }
    }
    return result;
  }, [stockItems]);

  const filteredLineItems = useMemo(
    () =>
      lineItems.filter((item) =>
        selectedStockItemId ? item.stockItemId === selectedStockItemId : true,
      ),
    [lineItems, selectedStockItemId],
  );

  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [editItemModalOpen, setEditItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<LineItemWithDetails | null>(
    null,
  );
  const [editStockItemModalOpen, setEditStockItemModalOpen] = useState(false);
  const [stockItemToEdit, setStockItemToEdit] =
    useState<StockItemWithSupplier | null>(null);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingCloseAction, setPendingCloseAction] = useState<
    (() => void) | null
  >(null);

  const handleConfirmClose = (closeAction: () => void) => {
    setPendingCloseAction(() => closeAction);
    setShowConfirmation(true);
  };

  const handleModalClose = () => {
    setAddItemModalOpen(false);
    setFormResetKey((prev) => prev + 1);
  };

  const handleSuccess = () => handleModalClose();

  const handleEditItem = (item: LineItemWithDetails) => {
    setItemToEdit(item);
    setEditItemModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditItemModalOpen(false);
    setItemToEdit(null);
  };

  const handleDisposeItem = (item: LineItemWithDetails) => {
    console.log("Dispose item:", item);
  };

  const handleEditStockItem = (stockItem: StockItemWithSupplier) => {
    setStockItemToEdit(stockItem);
    setEditStockItemModalOpen(true);
  };

  const handleEditStockItemModalClose = () => {
    setEditStockItemModalOpen(false);
    setStockItemToEdit(null);
  };

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="grid grid-cols-2">
        {selectedStockItemId ? (
          <div className="flex items-center gap-4 p-4">
            <Button
              variant="positive"
              onClick={() => setSelectedStockItemId(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to All Items
            </Button>
            <h2 className="text-lg font-semibold text-gray-700">
              {filteredLineItems[0]?.stockItemName || "Item"} from{" "}
              {filteredLineItems[0]?.supplier?.name || "No supplier"}
            </h2>
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
        ) : selectedStockItemId ? (
          <StockTable
            stockItems={filteredLineItems}
            onEdit={handleEditItem}
            onDispose={handleDisposeItem}
          />
        ) : (
          <AggregateStockTable
            stockItems={stockItems}
            filter={filter}
            onItemNameClick={setSelectedStockItemId}
            onEditItem={handleEditStockItem}
          />
        )}
      </div>

      <Modal
        open={addItemModalOpen}
        onClose={() => handleConfirmClose(handleModalClose)}
      >
        <AddStockItemForm
          key={formResetKey}
          onSuccess={handleSuccess}
          prefillData={
            selectedStockItemId
              ? stockItems.find((si) => si._id === selectedStockItemId)
              : undefined
          }
        />
      </Modal>

      {itemToEdit && (
        <Modal
          open={editItemModalOpen}
          onClose={() => handleConfirmClose(handleEditModalClose)}
        >
          <EditLineItemForm
            item={itemToEdit}
            onSuccess={handleEditModalClose}
          />
        </Modal>
      )}

      {stockItemToEdit && (
        <Modal
          open={editStockItemModalOpen}
          onClose={() => handleConfirmClose(handleEditStockItemModalClose)}
        >
          <EditStockItemNameModal
            stockItem={stockItemToEdit}
            onSuccess={handleEditStockItemModalClose}
          />
        </Modal>
      )}

      <ConfirmModal
        open={showConfirmation}
        message="Discard changes?"
        onConfirm={() => {
          setShowConfirmation(false);
          if (pendingCloseAction) {
            pendingCloseAction();
            setPendingCloseAction(null);
          }
        }}
        onCancel={() => {
          setShowConfirmation(false);
          setPendingCloseAction(null);
        }}
      />
    </div>
  );
};
