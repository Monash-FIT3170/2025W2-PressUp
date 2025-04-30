import React, { useState } from "react";
import { StockItem } from "/imports/api/stock_item";
import { StockTable } from "../../components/StockTable";
import { Mongo } from "meteor/mongo";
import { StockFilter } from "../../components/StockFilter";

// TODO: Delete this mock function when integrating with API
const mockStockItems = (amount: number) => {
  const rand = (max: number) => Math.floor(Math.random() * max);
  let result: StockItem[] = [];
  for (let i = 0; i < amount; ++i) {
    result.push({
      _id: new Mongo.ObjectID(),
      name: [
        "Coffee Beans",
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        "Almond Milk",
      ][rand(3)],
      quantity: [0, 99999999, 100, 10][rand(4)],
      location: `Room ${["1029381290129083190238120312938190282038120381029819028", "1", "2", "33"][rand(4)]}`,
      supplier: `Supplier ${["102938129089127012801238120128091238901289012890128", "1", "2", "727"][rand(4)]}`,
    });
  }
  return result;
};

export const StockPage = () => {
  // TODO: Get from API here
  const stockItems: StockItem[] = mockStockItems(100);

  const [filter, setFilter] = useState<"all" | "inStock" | "lowInStock" | "outOfStock">("all");

  const lowStockThreshold = 10; // TODO: Make this dynamic based on user choice

  const filteredStockItems = stockItems.filter((item) => {
    if (filter === "inStock") return item.quantity > lowStockThreshold;
    if (filter === "outOfStock") return item.quantity === 0;
    if (filter === "lowInStock") return item.quantity > 0 && item.quantity <= lowStockThreshold;
    return true;
  });

  return (
    <div id="stock" className="flex flex-1 flex-col">
      <StockFilter filter={filter} onFilterChange={setFilter} />

      <StockTable stockItems={filteredStockItems} />
    </div>
  );
};
