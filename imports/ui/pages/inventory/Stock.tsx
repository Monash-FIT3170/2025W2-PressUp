import React from "react";
import { Pill } from "../../components/Pill";
import { StockItem } from "/imports/api/stock_item";
import {
  InStock,
  LowInStock,
  OutOfStock,
} from "../../components/StatusSymbols";

export const StockPage = () => {
  // TODO: Get from API here
  const stockItems: StockItem[] = [
    {
      _id: "1",
      name: "Coffee Beans",
      quantity: 10,
      location: "Room 1",
      supplier: "Supplier 1",
      createdAt: new Date(),
    },
    {
      _id: "2",
      name: "Small Small Small Small Takeaway Cups",
      quantity: 999999999999,
      location: "Room 21232813018912",
      supplier: "Supplier 1198230928311028301",
      createdAt: new Date(),
    },
    {
      _id: "3",
      name: "Almond Milk",
      quantity: 0,
      location: "Room 1",
      supplier: "Supplier 2",
      createdAt: new Date(),
    },
    {
      _id: "1",
      name: "Coffee Beans",
      quantity: 10,
      location: "Room 1",
      supplier: "Supplier 1",
      createdAt: new Date(),
    },
    {
      _id: "2",
      name: "Small Small Small Small Takeaway Cups",
      quantity: 999999999999,
      location: "Room 21232813018912",
      supplier: "Supplier 1198230928311028301",
      createdAt: new Date(),
    },
    {
      _id: "3",
      name: "Almond Milk",
      quantity: 0,
      location: "Room 1",
      supplier: "Supplier 2",
      createdAt: new Date(),
    },
    {
      _id: "1",
      name: "Coffee Beans",
      quantity: 10,
      location: "Room 1",
      supplier: "Supplier 1",
      createdAt: new Date(),
    },
    {
      _id: "2",
      name: "Small Small Small Small Takeaway Cups",
      quantity: 999999999999,
      location: "Room 21232813018912",
      supplier: "Supplier 1198230928311028301",
      createdAt: new Date(),
    },
    {
      _id: "3",
      name: "Almond Milk",
      quantity: 0,
      location: "Room 1",
      supplier: "Supplier 2",
      createdAt: new Date(),
    },
    {
      _id: "1",
      name: "Coffee Beans",
      quantity: 10,
      location: "Room 1",
      supplier: "Supplier 1",
      createdAt: new Date(),
    },
    {
      _id: "2",
      name: "Small Small Small Small Takeaway Cups",
      quantity: 999999999999,
      location: "Room 21232813018912",
      supplier: "Supplier 1198230928311028301",
      createdAt: new Date(),
    },
    {
      _id: "3",
      name: "Almond Milk",
      quantity: 0,
      location: "Room 1",
      supplier: "Supplier 2",
      createdAt: new Date(),
    },
    {
      _id: "1",
      name: "Coffee Beans",
      quantity: 10,
      location: "Room 1",
      supplier: "Supplier 1",
      createdAt: new Date(),
    },
    {
      _id: "2",
      name: "Small Small Small Small Takeaway Cups",
      quantity: 999999999999,
      location: "Room 21232813018912",
      supplier: "Supplier 1198230928311028301",
      createdAt: new Date(),
    },
    {
      _id: "3",
      name: "Almond Milk",
      quantity: 0,
      location: "Room 1",
      supplier: "Supplier 2",
      createdAt: new Date(),
    },
  ];

  // TODO: Make this dynamic based on user choice
  const lowInStockThreshold = 10;

  if (stockItems.length == 0) return <h1>No inventory items</h1>;

  return (
    <div id="stock" className="flex flex-1">
      <div id="grid-container" className="overflow-auto flex-1">
        <div className="grid grid-cols-5 g gap-y-2 text-nowrap text-center grid-cols-[minmax(0,2fr)_min-content_1fr_min-content_1fr] text-red-900">
          <div className="bg-rose-200 py-1 px-2 border-y-3 border-rose-200 rounded-l-lg sticky top-0 z-1 text-left">
            Item Name
            <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
          </div>
          <div className="bg-rose-200 py-1 px-2 border-y-3 border-rose-200 sticky top-0 z-1">
            Quantity
            <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
          </div>
          <div className="bg-rose-200 py-1 px-2 border-y-3 border-rose-200 sticky top-0 z-1">
            Stock Room
            <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
          </div>
          <div className="bg-rose-200 py-1 px-2 border-y-3 border-rose-200 sticky top-0 z-1">
            Status
            <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
          </div>
          <div className="bg-rose-200 py-1 px-2 border-y-3 border-rose-200 rounded-r-lg sticky top-0 z-1">
            Supplier
          </div>
          {stockItems.map((item, i) => {
            const statusPill =
              item.quantity == 0 ? (
                <Pill
                  bgColour="bg-red-700"
                  borderColour="border-red-700"
                  textColour="text-white"
                >
                  Out of Stock
                </Pill>
              ) : item.quantity <= lowInStockThreshold ? (
                <Pill
                  bgColour="bg-sky-300"
                  borderColour="border-sky-300"
                  textColour="text-white"
                >
                  Low in Stock
                </Pill>
              ) : (
                <Pill
                  bgColour="bg-green-700"
                  borderColour="border-green-700"
                  textColour="text-white"
                >
                  In Stock
                </Pill>
              );

            const stockIcon =
              item.quantity == 0 ? (
                <OutOfStock />
              ) : item.quantity <= lowInStockThreshold ? (
                <LowInStock />
              ) : (
                <InStock />
              );

            return (
              <React.Fragment key={i}>
                <div className="text-left truncate relative py-1 px-2">
                  {item.name}
                  <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
                </div>
                <div className="relative py-1 px-2 flex justify-end">
                  <span className="truncate max-w-full px-1">
                    {item.quantity}
                  </span>
                  <span className="flex-shrink-0 self-center">{stockIcon}</span>
                  <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
                </div>
                <div className="truncate relative py-1 px-2">
                  {item.location}
                  <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
                </div>
                <div className="relative py-1 px-2">
                  {statusPill}
                  <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
                </div>
                <div className="truncate py-1 px-2">{item.supplier}</div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
