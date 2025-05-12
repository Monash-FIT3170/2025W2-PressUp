import React, { useEffect, useState } from "react";
import { StockItem } from "/imports/api/stock_item";
import { StockTable } from "../../components/StockTable";
import { Modal } from "../../components/Modal";
import { AddItemForm } from "../../components/AddItemForm";
import { StockFilter } from "../../components/StockFilter";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { useLocation } from "react-router";

// TODO: Delete this mock function when integrating with API
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
      location: `Room ${[
          "1029381290129083190238120312938190282038120381029819028",
          "1",
          "2",
          "33",
        ][rand(4)]
        }`,
      supplier: `Supplier ${[
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
  // Set title
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Inventory Management - Stock");
  }, [setPageTitle]);

  // TODO: Get from API here
  const stockItems: StockItem[] = mockStockItems(100);

  const [filter, setFilter] = useState<
    "all" | "inStock" | "lowInStock" | "outOfStock"
  >("all");

  const lowStockThreshold = 10; // TODO: Make this dynamic based on user choice

  const filteredStockItems = stockItems.filter((item) => {
    if (filter === "inStock") return item.quantity > lowStockThreshold;
    if (filter === "outOfStock") return item.quantity === 0;
    if (filter === "lowInStock")
      return item.quantity > 0 && item.quantity <= lowStockThreshold;
    return true;
  });

  // Modal state
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="flex flex-1 flex-col">
      <div className="grid grid-cols-2">
        <StockFilter filter={filter} onFilterChange={setFilter} />
        <button
          onClick={() => setOpen(true)}
          className="justify-self-end shadow-lg/20 ease-in-out transition-all duration-300 p-1 m-4 rounded-xl px-3 bg-rose-400 text-white cursor-pointer w-24 right-2 hover:bg-rose-500"
        >
          Add Item
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <StockTable stockItems={filteredStockItems} />
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <AddItemForm></AddItemForm>
        <div className="grid grid-cols-2 p-4">
          <button
            onClick={() => setOpen(false)}
            className="ease-in-out transition-all duration-300 shadow-lg/20 cursor-pointer mr-4 text-white bg-neutral-400 hover:bg-neutral-500 focus:drop-shadow-none focus:ring-2 focus:outline-none focus:ring-neutral-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-neutral-500 dark:hover:bg-neutral-600 dark:focus:ring-neutral-600"
          >
            Cancel
          </button>
          <button
            onClick={() => setOpen(false)}
            className="ease-in-out transition-all duration-300 shadow-lg/20 cursor-pointer ml-4 text-white bg-rose-400 hover:bg-rose-500 focus:drop-shadow-none focus:ring-2 focus:outline-none focus:ring-rose-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-rose-300 dark:hover:bg-rose-400 dark:focus:ring-rose-400"
          >
            Add item
          </button>
        </div>
      </Modal>
    </div>
  );
};
