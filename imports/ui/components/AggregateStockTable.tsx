import React, { useState, useMemo, useEffect, useCallback } from "react";
import { StockItemWithSupplier } from "../pages/inventory/types";
import { Pill } from "./Pill";
import { OutOfStock, InStock, LowInStock } from "./symbols/StatusSymbols";
import { Table, TableColumn } from "./Table";
import { Meteor } from "meteor/meteor";
import { Pencil } from "lucide-react";
import { Input } from "./interaction/Input";

interface AggregatedStockItem {
  name: string;
  totalQuantity: number;
  itemCount: number;
}

interface AggregateStockTableProps {
  stockItems: StockItemWithSupplier[];
  filter?: "all" | "inStock" | "lowInStock" | "outOfStock";
  onItemNameClick?: (name: string) => void;
}

interface EditableNameProps {
  name: string;
  onSave: (newName: string) => void;
  onItemClick?: (name: string) => void;
}

const EditableName = ({ name, onSave, onItemClick }: EditableNameProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);

  useEffect(() => {
    setEditValue(name);
  }, [name]);

  const handleSave = () => {
    if (editValue.trim() && editValue !== name) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
    setEditValue(name);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(name);
    }
  };

  if (isEditing) {
    return (
      <div className="max-w-xs">
        <Input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyPress}
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className="truncate cursor-pointer hover:text-blue-600 underline decoration-2 underline-offset-2"
        onClick={() => onItemClick?.(name)}
        title="Click to view details"
      >
        {name}
      </span>
      <button
        onClick={() => setIsEditing(true)}
        className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
        title="Edit name"
      >
        <Pencil size={14} className="text-gray-500 hover:text-blue-600" />
      </button>
    </div>
  );
};

export const AggregateStockTable = ({
  stockItems,
  filter = "all",
  onItemNameClick,
}: AggregateStockTableProps) => {
  const lowInStockThreshold = 10;

  const aggregatedItems = useMemo(() => {
    const itemGroups = new Map<string, StockItemWithSupplier[]>();

    // Group items by name
    for (const stockItem of stockItems) {
      if (!itemGroups.has(stockItem.name)) {
        itemGroups.set(stockItem.name, []);
      }
      itemGroups.get(stockItem.name)!.push(stockItem);
    }

    // Aggregate data for each group
    const result = [];
    for (const [name, items] of itemGroups) {
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

      result.push({
        name,
        totalQuantity,
        itemCount: items.length,
      });
    }

    // Filter aggregated results
    return result.filter((item) => {
      if (filter === "inStock") return item.totalQuantity > lowInStockThreshold;
      if (filter === "outOfStock") return item.totalQuantity === 0;
      if (filter === "lowInStock")
        return (
          item.totalQuantity > 0 && item.totalQuantity <= lowInStockThreshold
        );
      return true;
    });
  }, [stockItems, filter]);

  const handleNameUpdate = useCallback((oldName: string, newName: string) => {
    Meteor.call(
      "stockItems.rename",
      oldName,
      newName,
      (error: Meteor.Error | undefined) => {
        if (error) {
          alert("Error updating item name: " + error.reason);
        }
      },
    );
  }, []);

  const columns = useMemo(
    (): TableColumn<AggregatedStockItem>[] => [
      {
        key: "name",
        header: "Item Name",
        gridCol: "minmax(0,1.5fr)",
        align: "left",
        render: (item) => (
          <EditableName
            name={item.name}
            onSave={(newName) => handleNameUpdate(item.name, newName)}
            onItemClick={onItemNameClick}
          />
        ),
      },
      {
        key: "itemCount",
        header: "Line Items",
        gridCol: "min-content",
        render: (item) => (
          <span className="text-sm text-gray-600">{item.itemCount}</span>
        ),
      },
      {
        key: "quantity",
        header: "Total Quantity",
        gridCol: "min-content",
        align: "right",
        render: (item) => {
          const stockIcon =
            item.totalQuantity == 0 ? (
              <OutOfStock />
            ) : item.totalQuantity <= lowInStockThreshold ? (
              <LowInStock />
            ) : (
              <InStock />
            );

          return (
            <div className="flex justify-end">
              <span className="truncate max-w-full px-1">
                {item.totalQuantity}
              </span>
              <span className="flex-shrink-0 self-center">{stockIcon}</span>
            </div>
          );
        },
      },

      {
        key: "status",
        header: "Status",
        gridCol: "min-content",
        render: (item) => {
          if (item.totalQuantity == 0) {
            return (
              <Pill
                bgColour="bg-red-700"
                borderColour="border-red-700"
                textColour="text-white"
              >
                Out of Stock
              </Pill>
            );
          } else if (item.totalQuantity <= lowInStockThreshold) {
            return (
              <Pill
                bgColour="bg-sky-300"
                borderColour="border-sky-300"
                textColour="text-white"
              >
                Low in Stock
              </Pill>
            );
          } else {
            return (
              <Pill
                bgColour="bg-green-700"
                borderColour="border-green-700"
                textColour="text-white"
              >
                In Stock
              </Pill>
            );
          }
        },
      },
    ],
    [handleNameUpdate, onItemNameClick, lowInStockThreshold],
  );

  return (
    <Table
      columns={columns}
      data={aggregatedItems}
      emptyMessage="No inventory items"
    />
  );
};
