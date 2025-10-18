import React from "react";
import { LineItemFilter as LineItemFilterEnum } from "../pages/inventory/types";

interface LineItemFilterProps {
  filter: LineItemFilterEnum;
  onFilterChange: (filter: LineItemFilterEnum) => void;
}

export const LineItemFilter = ({
  filter,
  onFilterChange,
}: LineItemFilterProps) => {
  return (
    <div className="flex items-center">
      <img
        src="/filter-icon.svg"
        alt="Filter Icon"
        className="mr-2 w-5 h-5 text-red-900"
      />
      <label htmlFor="line-item-filter" className="mr-2 font-bold text-red-900">
        Items:
      </label>
      <select
        id="line-item-filter"
        value={filter}
        onChange={(e) => onFilterChange(e.target.value as LineItemFilterEnum)}
        className="border border-red-900 rounded-xl px-3 py-1 text-red-900 bg-white"
      >
        <option value={LineItemFilterEnum.ALL}>All</option>
        <option value={LineItemFilterEnum.UNDISPOSED}>Undisposed</option>
        <option value={LineItemFilterEnum.NOT_EXPIRED}>Not Expired</option>
        <option value={LineItemFilterEnum.EXPIRED}>Expired</option>
        <option value={LineItemFilterEnum.DISPOSED}>Disposed</option>
      </select>
    </div>
  );
};
