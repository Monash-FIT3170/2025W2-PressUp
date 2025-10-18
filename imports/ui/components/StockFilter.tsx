import React from "react";
import { StockFilter as StockFilterEnum } from "../pages/inventory/types";

interface StockFilterProps {
  filter: StockFilterEnum;
  onFilterChange: (filter: StockFilterEnum) => void;
}

export const StockFilter = ({ filter, onFilterChange }: StockFilterProps) => {
  return (
    <div className="flex items-center">
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
        onChange={(e) => onFilterChange(e.target.value as StockFilterEnum)}
        className="border border-red-900 rounded-xl px-3 py-1 text-red-900 bg-white"
      >
        <option value={StockFilterEnum.ALL}>All</option>
        <option value={StockFilterEnum.IN_STOCK}>In Stock</option>
        <option value={StockFilterEnum.LOW_IN_STOCK}>Low in Stock</option>
        <option value={StockFilterEnum.OUT_OF_STOCK}>Out of Stock</option>
      </select>
    </div>
  );
};
