import React, { useState } from "react";
import { StockItem } from "/imports/api/StockItemsCollection";
import { StockTable } from "../../components/StockTable";
import { Modal } from "../../components/Modal";
import { AddItemForm } from "../../components/AddItemForm";
import { StockFilter } from "../../components/StockFilter";

// Mock data for now
const mockStockItems = (amount: number) => {
  const rand = (max: number) => Math.floor(Math.random() * max);
  let result: StockItem[] = [];
  for (let i = 0; i < amount; ++i) {
    result.push({
      name: [
"Coffee Beans",
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
"Almond Milk",
][rand(3)],
      quantity: [0, 99999999, 100, 10][rand(4)],
      location: `Room ${
        [
          "1029381290129083190238120312938190282038120381029819028",
"1",
"2",
"33",
][rand(4)]
      }`,
      supplier: `Supplier ${
        [
          "102938129089127012801238120128091238901289012890128",
"1",
"2",
"727",
][rand(4)]
      }`,
    });
  }
  return result;
};

export const StockPage = () => {
  const stockItems: StockItem[] = mockStockItems(100);

  const [filter, setFilter] = useState<
    "all" | "inStock" | "lowInStock" | "outOfStock"
  >("all");

  const [open, setOpen] = useState(false);

  const [formResetKey, setFormResetKey] = useState(0);

  const handleModalClose = () => {
    setOpen(false);
    setFormResetKey(prev => prev + 1);
  };

  const handleSuccess = () => {
    handleModalClose();
  };

  const lowStockThreshold = 10;
  const filteredStockItems = stockItems.filter((item) => {
    if (filter === "inStock") return item.quantity > lowStockThreshold;
    if (filter === "outOfStock") return item.quantity === 0;
    if (filter === "lowInStock")
      return item.quantity > 0 && item.quantity <= lowStockThreshold;
    return true;
  });

  return (
    <div>
      <div className="grid grid-cols-2">
        <StockFilter filter={filter} onFilterChange={setFilter} />
        <button
          onClick={() => setOpen(true)}
          className="justify-self-end shadow-lg/20 ease-in-out transition-all duration-300 p-1 m-4 rounded-xl px-3 bg-rose-400 text-white cursor-pointer w-24 right-2 hover:bg-rose-500"
        >
          Add Item
        </button>
      </div>
      <div id="stock" className="flex flex-1 flex-col">
        <StockTable stockItems={filteredStockItems} />
      </div>
      <Modal open={open} onClose={handleModalClose}>
        <AddItemForm key={formResetKey} onSuccess={handleSuccess} />
      </Modal>
    </div>
  );
};
