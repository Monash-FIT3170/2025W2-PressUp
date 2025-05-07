import React, { useRef, useState } from "react";
import { StockItem } from "/imports/api/StockItemsCollection";
import { StockTable } from "../../components/StockTable";
import { Modal } from "../../components/Modal";
import { AddItemForm } from "../../components/AddItemForm";
import { StockFilter } from "../../components/StockFilter";

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
  const [filter, setFilter] = useState<"all" | "inStock" | "lowInStock" | "outOfStock">("all");
  const lowStockThreshold = 10;
  const filteredStockItems = stockItems.filter((item) => {
    if (filter === "inStock") return item.quantity > lowStockThreshold;
    if (filter === "outOfStock") return item.quantity === 0;
    if (filter === "lowInStock") return item.quantity > 0 && item.quantity <= lowStockThreshold;
    return true;
  });

  const [open, setOpen] = useState<boolean>(false);

  // 👇 Ref to trigger submit
  const addItemFormRef = useRef<{ submitForm: () => void }>(null);

  const handleAddClick = () => {
    if (addItemFormRef.current) {
      addItemFormRef.current.submitForm();
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2">
        <StockFilter filter={filter} onFilterChange={setFilter} />
        <button
          onClick={() => setOpen(true)}
          className="justify-self-end p-1 m-4 rounded-xl px-3 bg-rose-400 text-white cursor-pointer w-24 hover:bg-rose-500"
        >
          Add Item
        </button>
      </div>
      <div id="stock" className="flex flex-1 flex-col">
        <StockTable stockItems={filteredStockItems} />
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <AddItemForm
          ref={addItemFormRef}
          onSuccess={() => setOpen(false)}
        />
        <div className="grid grid-cols-2 p-4">
          <button
            onClick={() => setOpen(false)}
            className="mr-4 text-white bg-neutral-400 hover:bg-neutral-500 rounded-lg px-5 py-2.5"
          >
            Cancel
          </button>
          <button
            onClick={handleAddClick}
            className="ml-4 text-white bg-rose-400 hover:bg-rose-500 rounded-lg px-5 py-2.5"
          >
            Add item
          </button>
        </div>
      </Modal>
    </div>
  );
};
