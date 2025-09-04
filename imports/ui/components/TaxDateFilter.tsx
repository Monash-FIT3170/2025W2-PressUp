import React from "react";
import { addMonths, subMonths, addYears, subYears } from "date-fns";

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
  const handlePrev = () => {
    switch (range) {
      case "month":
        onDateChange(subMonths(currentDate, 1));
        break;
      case "year":
        onDateChange(subYears(currentDate, 1));
        break;
      case "PAYG":
        onDateChange(subMonths(currentDate, 3));
        break;
      case "all":
      default:
        break; // do nothing
    }
  };

  const handleNext = () => {
    switch (range) {
      case "month":
        onDateChange(addMonths(currentDate, 1));
        break;
      case "year":
        onDateChange(addYears(currentDate, 1));
        break;
      case "PAYG":
        onDateChange(addMonths(currentDate, 3));
        break;
      case "all":
      default:
        break; // do nothing
    }
  };

  return (
    <div className="mb-4 flex items-center gap-2">
      <img src="/filter-icon.svg" alt="Filter Icon" className="w-5 h-5 text-red-900" />
      <label htmlFor="date-filter" className="font-bold text-red-900">
        Time:
      </label>
      <select
        id="date-filter"
        value={range}
        onChange={(e) =>
          onRangeChange(e.target.value as "all" | "PAYG" | "month" | "year")
        }
        className="border border-red-900 rounded-xl px-3 py-1 text-red-900 bg-white"
      >
        <option value="all">All Time</option>
        <option value="PAYG">PAYG Period</option>
        <option value="year">Year</option>
        <option value="month">Month</option>
      </select>

      {/* Prev/Next Buttons */}
      {range !== "all" && (
        <div className="ml-2 flex gap-1">
          <button
            onClick={handlePrev}
            className="px-2 py-1 bg-red-200 rounded hover:bg-red-300"
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            className="px-2 py-1 bg-red-200 rounded hover:bg-red-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

