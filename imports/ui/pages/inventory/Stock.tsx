import React from "react";
import { useState } from "react";
import { StockItem } from "/imports/api/stock_item";
import { StockTable } from "../../components/StockTable";
import { Pill } from "../../components/Pill";
import { Modal } from "../../components/Modal";

// TODO: Delete this mock function when integrating with API
const mockStockItems = (amount: number) => {
  const rand = (max: number) => Math.floor(Math.random() * max);
  let result: StockItem[] = [];
  for (let i = 0; i < amount; ++i) {
    result.push({
      _id: i.toString(),
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
      createdAt: new Date(),
    });
  }
  return result;
};

export const StockPage = () => {
  // TODO: Get from API here
  const stockItems: StockItem[] = mockStockItems(100);

  // Modal state
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setOpen(true)}>
        <Pill
          bgColour="bg-rose-400"
          borderColour="border-rose-400"
          textColour="text-white"
        >
          Add Item
        </Pill>
      </button>

      <div id="stock" className="flex flex-1">
        <StockTable stockItems={stockItems} />
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add new inventory item
          </h3>
        </div>
        <div className="p-4 md:p-5">
          <form className="space-y-4" action="#">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Item Name
              </label>
              <input
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                placeholder="Coffee"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Quantity
              </label>
              <input
                placeholder="0"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                required
              />
            </div>
            <div className="grid grid-cols-2">
              <button
                onClick={() => setOpen(false)}
                className="mr-2 w-full border border-gray-200 text-black bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-rose-400 dark:hover:bg-rose-500 dark:focus:ring-rose-600"
              >
                Cancel
              </button>
              <button className="ml-2 w-full text-white bg-rose-400 hover:bg-rose-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-rose-400 dark:hover:bg-rose-500 dark:focus:ring-rose-600">
                Add item
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
