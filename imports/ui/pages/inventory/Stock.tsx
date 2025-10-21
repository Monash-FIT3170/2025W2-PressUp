import React, { useState, useEffect, useMemo } from "react";
import { Meteor } from "meteor/meteor";
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
import { LineItemFilter as LineItemFilterComponent } from "../../components/LineItemFilter";
import {
  LineItemFilter as LineItemFilterKey,
  StockFilter as StockFilterKey,
} from "./types";
import { Button } from "../../components/interaction/Button";
import { ConfirmModal } from "../../components/ConfirmModal";
import { ArrowLeft } from "lucide-react";

export const StockPage = () => {
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Inventory Management - Stock");
  }, [setPageTitle]);

  const [filter, setFilter] = useState<StockFilterKey>(StockFilterKey.ALL);
  const [lineItemFilter, setLineItemFilter] = useState<LineItemFilterKey>(
    LineItemFilterKey.UNDISPOSED,
  );
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

      // Set quantity visually to 0 for disposed items
      const processedLineItems = stockItem.lineItems.map((lineItem) => ({
        ...lineItem,
        quantity: lineItem.disposed ? 0 : lineItem.quantity,
      }));

      result.push({
        ...stockItem,
        supplier,
        lineItems: processedLineItems,
      });
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

  const filteredLineItems = useMemo(() => {
    let filtered = lineItems.filter((item) =>
      selectedStockItemId ? item.stockItemId === selectedStockItemId : true,
    );

    const today = new Date();
    switch (lineItemFilter) {
      case LineItemFilterKey.UNDISPOSED:
        filtered = filtered.filter((item) => !item.disposed);
        break;
      case LineItemFilterKey.NOT_EXPIRED:
        filtered = filtered.filter(
          (item) => !item.expiry || item.expiry > today,
        );
        break;
      case LineItemFilterKey.EXPIRED:
        filtered = filtered.filter(
          (item) => item.expiry && item.expiry <= today,
        );
        break;
      case LineItemFilterKey.DISPOSED:
        filtered = filtered.filter((item) => item.disposed);
        break;
      default:
        break;
    }

    return filtered;
  }, [lineItems, selectedStockItemId, lineItemFilter]);

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
    Meteor.call(
      "stockItems.toggleDisposeLineItem",
      item.stockItemId,
      item.id,
      (error: Meteor.Error | undefined) => {
        if (error) {
          alert("Error updating item: " + error.reason);
        }
      },
    );
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
      {selectedStockItemId && (
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-700">
            {filteredLineItems[0]?.stockItemName || "Item"} from{" "}
            {filteredLineItems[0]?.supplier?.name || "No supplier"}
          </h2>
        </div>
      )}
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-4">
          {selectedStockItemId ? (
            <>
              <Button
                variant="positive"
                onClick={() => setSelectedStockItemId(null)}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to All Items
              </Button>
              <LineItemFilterComponent
                filter={lineItemFilter}
                onFilterChange={setLineItemFilter}
              />
            </>
          ) : (
            <StockFilter filter={filter} onFilterChange={setFilter} />
          )}
        </div>
        <Button variant="positive" onClick={() => setAddItemModalOpen(true)}>
          Add Item
        </Button>
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
