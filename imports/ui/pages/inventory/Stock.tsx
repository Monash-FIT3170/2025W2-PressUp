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
            Sign in to our platform
          </h3>
        </div>
        <div className="p-4 md:p-5">
          <form className="space-y-4" action="#">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Your email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                placeholder="name@company.com"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Your password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                required
              />
            </div>
            <div className="flex justify-between">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="remember"
                    type="checkbox"
                    value=""
                    className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-600 dark:border-gray-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"
                    required
                  />
                </div>
                <label className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Remember me
                </label>
              </div>
              <a
                href="#"
                className="text-sm text-blue-700 hover:underline dark:text-blue-500"
              >
                Lost Password?
              </a>
            </div>
            <button
              type="submit"
              className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Login to your account
            </button>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
              Not registered?{" "}
              <a
                href="#"
                className="text-blue-700 hover:underline dark:text-blue-500"
              >
                Create account
              </a>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
