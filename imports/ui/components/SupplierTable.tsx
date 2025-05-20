import React from "react";
import { Pill } from "./Pill";
import { Supplier } from "/imports/api";

interface SupplierTableProps {
  suppliers: Supplier[];
}

export const SupplierTable = ({ suppliers }: SupplierTableProps) => {
  if (suppliers.length === 0)
    return (
      <h2 className="flex-1 text-center font-bold text-xl text-red-900">
        No suppliers found
      </h2>
    );

  return (
    <div id="grid-container" className="overflow-auto flex-1">
      <div className="grid gap-y-2 text-nowrap text-center grid-cols-[minmax(0,2fr)_1fr_1.5fr_1fr_1fr] text-red-900">
        <div className="bg-rose-200 py-1 px-2 border-y-3 border-rose-200 rounded-l-lg sticky top-0 z-1 text-left">
          Supplier Name
          <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
        </div>
        <div className="bg-rose-200 py-1 px-2 border-y-3 border-rose-200 sticky top-0 z-1">
          Contact
          <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
        </div>
        <div className="bg-rose-200 py-1 px-2 border-y-3 border-rose-200 sticky top-0 z-1">
          Supplier Goods
          <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
        </div>
        <div className="bg-rose-200 py-1 px-2 border-y-3 border-rose-200 sticky top-0 z-1">
          Past Orders
          <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
        </div>
        <div className="bg-rose-200 py-1 px-2 border-y-3 border-rose-200 rounded-r-lg sticky top-0 z-1">
          PO
        </div>
        
        {suppliers.map((supplier, i) => (
          <React.Fragment key={i}>
            <div className="text-left truncate relative py-1 px-2">
              {supplier.name}
              <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
            </div>
            <div className="relative py-1 px-2 flex flex-col">
              <a href={`mailto:${supplier.email}`} className="text-blue-500 hover:underline truncate">
                {supplier.email}
              </a>
              <span className="text-gray-600 truncate">{supplier.phone}</span>
              <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
            </div>
            <div className="truncate relative py-1 px-2 flex flex-wrap gap-1">
              {supplier.goods && supplier.goods.map((good, goodIndex) => (
                <Pill
                  key={goodIndex}
                  bgColour="bg-red-400"
                  borderColour="border-red-400"
                  textColour="text-white"
                >
                  {good}
                </Pill>
              ))}
              <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
            </div>
            <div className="relative py-1 px-2 text-center">
              {/* Placeholder for Past Orders - will be implemented later */}
              <span className="text-gray-800 font-medium">-</span>
              <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
            </div>
            <div className="truncate py-1 px-2 text-center">
              <button className="px-3 py-1 bg-red-400 text-white rounded-md hover:bg-red-500 transition-all duration-300">
                Order
              </button>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};