import React from "react";
import { StockItem } from "/imports/api/stock_item";
import { StockTable } from "../../components/StockTable";

// TODO: Delete this mock function when integrating with API
const mockStockItems = (amount: number) => {
  const rand = (max: number) => Math.floor(Math.random() * max);
  let result: StockItem[] = [];
  for (let i = 0; i < amount; ++i) {
    result.push({
      _id: i.toString(),
      name: [
        "Coffee Beans",
        "Sryup",
        "Almond Milk",
      ][rand(3)],
      quantity: [0, 99999999, 100, 10][rand(4)],
      location: `Room ${["1029381290129083190238120312938190282038120381029819028", "1", "2", "33"][rand(4)]}`,
      supplier: `Supplier ${["102938129089127012801238120128091238901289012890128", "1", "2", "727"][rand(4)]}`,
      createdAt: new Date(),
    });
  }
  return result;
};

export const StockPage = () => {
  // TODO: Get from API here
  const stockItems: StockItem[] = mockStockItems(10);

  return (
    <div id="stock" className="flex flex-1">
      <StockTable stockItems={stockItems} />
    </div>
  );
};
