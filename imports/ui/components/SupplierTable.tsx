import React from "react";
import { Supplier } from "/imports/api/suppliers/SuppliersCollection";
import { InfoSymbol, Cross } from "./symbols/GeneralSymbols";
import { Pill } from "./Pill";

interface SupplierTableProps {
  suppliers: Supplier[];
}

export const SupplierTable = ({ suppliers }: SupplierTableProps) => {
  if (suppliers.length === 0)
    return (
      <h2 className="flex-1 text-center font-bold text-xl text-red-900">
        No suppliers found.
      </h2>
    );

  return (
    <div id="grid-container" className="overflow-auto flex-1">
      <div className="grid gap-y-2 text-nowrap text-center grid-cols-15 text-red-900">
        <div className="col-span-4 bg-rose-200 py-1 px-2 border-y-3 border-rose-200 rounded-l-lg sticky top-0 z-1 text-left">
          Supplier Name
          <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
        </div>
        <div className="col-span-4 bg-rose-200 py-1 px-2 border-y-3 border-rose-200 sticky top-0 z-1">
          Contact
          <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
        </div>
        <div className="col-span-3 bg-rose-200 py-1 px-2 border-y-3 border-rose-200 sticky top-0 z-1">
          Supplier Goods
          <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
        </div>
        <div className="col-span-2 bg-rose-200 py-1 px-2 border-y-3 border-rose-200 sticky top-0 z-1">
          Past Orders
          <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
        </div>
        <div className="col-span-2 bg-rose-200 py-1 px-2 border-y-3 border-rose-200 rounded-r-lg sticky top-0 z-1">
          PO
        </div>
        {suppliers.map((supplier, i) => {
          return (
            <React.Fragment key={i}>
              <div className="col-span-4 text-left truncate relative py-1 px-2 flex items-center">
                <span className="truncate max-w-full px-1">
                  {supplier.name}
                </span>
                <span className="flex-shrink-0 ml-auto cursor-pointer">
                  {<InfoSymbol fill="#E76573" viewBox="0 0 24 24" />}
                </span>
                <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
              </div>
              <div className="col-span-4 truncate relative py-1 px-2">
                <div className="grid-rows-2">
                  <div>
                    <a
                      href={`mailto:${supplier.email}`}
                      className="text-blue-600 dark:text-blue-500 hover:underline"
                    >
                      {supplier.email}
                    </a>
                  </div>
                  <div>{supplier.phone}</div>
                </div>
                <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
              </div>
              <div className="col-span-3 flex flex-wrap relative py-1 px-2">
                {supplier.goods.map((good) => (
                  <span className="bg-rose-400 border-rose-300 text-white rounded-sm text-xs m-1 w-max h-max px-2 py-1 inline-flex items-center">
                    {good}
                    <span className="pl-2 ml-auto cursor-pointer">
                      {<Cross height="8px" width="8px" viewBox="0 0 14 14" />}
                    </span>
                  </span>
                ))}
                <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
              </div>
              <div className="col-span-2 relative py-1 px-2 flex items-center justify-center">
                {supplier.pastOrderQty}
                <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
              </div>
              <div className="col-span-2 truncate py-1 px-2 flex items-center justify-center">
                <button className="bg-pink-900 rounded-4xl text-white px-4 p-2 cursor-pointer ">
                  Create PO
                </button>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};