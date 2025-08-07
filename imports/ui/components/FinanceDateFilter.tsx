import React from "react";

interface FinanceDateFilterProps {
  range:
    | "all"
    | "today"
    | "thisWeek"
    | "thisMonth"
    | "thisYear"
    | "past7Days"
    | "past30Days";
  onRangeChange: (
    range:
      | "all"
      | "today"
      | "thisWeek"
      | "thisMonth"
      | "thisYear"
      | "past7Days"
      | "past30Days"
  ) => void;
}

export const FinanceDateFilter = ({ range, onRangeChange }: FinanceDateFilterProps) => {
  return (
    <div className="mb-4 flex items-center">
      <img
        src="/filter-icon.svg"
        alt="Filter Icon"
        className="mr-2 w-5 h-5 text-red-900"
      />
      <label htmlFor="date-filter" className="mr-2 font-bold text-red-900">
        Time:
      </label>
      <select
        id="date-filter"
        value={range}
        onChange={(e) =>
          onRangeChange(
            e.target.value as
              | "all"
              | "today"
              | "thisWeek"
              | "thisMonth"
              | "thisYear"
              | "past7Days"
              | "past30Days"
          )
        }
        className="border border-red-900 rounded-xl px-3 py-1 text-red-900 bg-white"
      >
        <option value="all">All Time</option>
        <option value="today">Today</option>
        <option value="thisWeek">This Week</option>
        <option value="thisMonth">This Month</option>
        <option value="thisYear">This Year</option>
        <option value="past7Days">Past 7 Days</option>
        <option value="past30Days">Past 30 Days</option>
      </select>
    </div>
  );
};
