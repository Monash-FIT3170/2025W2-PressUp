import React from "react";

interface StockFilterProps {
  filter: "all" | "inStock" | "lowInStock" | "outOfStock";
  onFilterChange: (filter: "all" | "inStock" | "lowInStock" | "outOfStock") => void;
}

export const StockFilter = ({ filter, onFilterChange }: StockFilterProps) => {
  return (
    <div className="mb-4 flex items-center">
      <img
        src="/filter-icon.svg"
        alt="Filter Icon"
        className="mr-2 w-5 h-5 text-red-900"
      />
      <label htmlFor="stock-filter" className="mr-2 font-bold text-red-900">
        Status:
      </label>
      <select
        id="stock-filter"
        value={filter}
        onChange={(e) => onFilterChange(e.target.value as "all" | "inStock" | "lowInStock" | "outOfStock")}
        className="border border-red-900 rounded-xl px-3 py-1 text-red-900 bg-white"
      >
        <option value="all">All</option>
        <option value="inStock">In Stock</option>
        <option value="lowInStock">Low in Stock</option>
        <option value="outOfStock">Out of Stock</option>
      </select>
    </div>
  );
};