import React from "react";
import {
  addMonths,
  subMonths,
  addYears,
  subYears,
  startOfYear,
  startOfMonth,
} from "date-fns";

interface TaxDateFilterProps {
  range: "all" | "PAYG" | "month" | "year";
  currentDate: Date;
  onRangeChange: (range: "all" | "PAYG" | "month" | "year") => void;
  onDateChange: (date: Date) => void;
}

export const TaxDateFilter = ({
  range,
  currentDate,
  onRangeChange,
  onDateChange,
}: TaxDateFilterProps) => {
  const today = new Date();

  // figure out if next is allowed
  const isNextDisabled = (() => {
    if (range === "month") {
      return startOfMonth(currentDate) >= startOfMonth(today);
    }
    if (range === "year") {
      return startOfYear(currentDate) >= startOfYear(today);
    }
    if (range === "PAYG") {
      const quarterStart = Math.floor(today.getMonth() / 3) * 3;
      const thisQuarter = new Date(today.getFullYear(), quarterStart, 1);
      return currentDate >= thisQuarter;
    }
    return true; // disable if "all"
  })();

  const handlePrev = () => {
    if (range === "month") onDateChange(subMonths(currentDate, 1));
    if (range === "year") onDateChange(subYears(currentDate, 1));
    if (range === "PAYG") onDateChange(subMonths(currentDate, 3));
  };

  const handleNext = () => {
    if (isNextDisabled) return;
    if (range === "month") onDateChange(addMonths(currentDate, 1));
    if (range === "year") onDateChange(addYears(currentDate, 1));
    if (range === "PAYG") onDateChange(addMonths(currentDate, 3));
  };

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
          onRangeChange(e.target.value as "all" | "PAYG" | "year" | "month")
        }
        className="border border-red-900 rounded-xl px-3 py-1 text-red-900 bg-white"
      >
        <option value="all">All Time</option>
        <option value="PAYG">PAYG Period</option>
        <option value="year">Year</option>
        <option value="month">Month</option>
      </select>

      {range !== "all" && (
        <div className="ml-4 flex gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="px-3 py-1 bg-press-up-light-purple rounded-xl hover:bg-press-up-purple"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={isNextDisabled}
            className={`px-3 py-1 rounded-xl ${
              isNextDisabled
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-press-up-light-purple hover:bg-press-up-purple"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
