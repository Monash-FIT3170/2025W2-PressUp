import React from "react";
import {
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  addYears,
  subYears,
  startOfToday,
  startOfWeek,
  startOfMonth,
  startOfYear,
} from "date-fns";

interface FinanceDateFilterProps {
  range:
    | "all"
    | "today"
    | "thisWeek"
    | "thisMonth"
    | "thisYear"
    | "past7Days"
    | "past30Days";
  currentDate?: Date;
  onRangeChange: (
    range:
      | "all"
      | "today"
      | "thisWeek"
      | "thisMonth"
      | "thisYear"
      | "past7Days"
      | "past30Days",
  ) => void;
  onDateChange?: (date: Date) => void;
}

export const FinanceDateFilter = ({
  range,
  currentDate = new Date(),
  onRangeChange,
  onDateChange,
}: FinanceDateFilterProps) => {
  const today = startOfToday();

  // Figure out if next is allowed
  const isNextDisabled = (() => {
    if (range === "today") {
      return currentDate >= today;
    }
    if (range === "thisWeek") {
      return startOfWeek(currentDate) >= startOfWeek(today);
    }
    if (range === "thisMonth") {
      return startOfMonth(currentDate) >= startOfMonth(today);
    }
    if (range === "thisYear") {
      return startOfYear(currentDate) >= startOfYear(today);
    }
    if (range === "past7Days") {
      return currentDate >= today;
    }
    if (range === "past30Days") {
      return currentDate >= today;
    }
    return true; // disable if "all"
  })();

  const handlePrev = () => {
    if (!onDateChange) return;
    if (range === "today") onDateChange(subDays(currentDate, 1));
    if (range === "thisWeek") onDateChange(subWeeks(currentDate, 1));
    if (range === "thisMonth") onDateChange(subMonths(currentDate, 1));
    if (range === "thisYear") onDateChange(subYears(currentDate, 1));
    if (range === "past7Days") onDateChange(subDays(currentDate, 1));
    if (range === "past30Days") onDateChange(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (isNextDisabled || !onDateChange) return;
    if (range === "today") onDateChange(addDays(currentDate, 1));
    if (range === "thisWeek") onDateChange(addWeeks(currentDate, 1));
    if (range === "thisMonth") onDateChange(addMonths(currentDate, 1));
    if (range === "thisYear") onDateChange(addYears(currentDate, 1));
    if (range === "past7Days") onDateChange(addDays(currentDate, 1));
    if (range === "past30Days") onDateChange(addDays(currentDate, 1));
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
          onRangeChange(
            e.target.value as
              | "all"
              | "today"
              | "thisWeek"
              | "thisMonth"
              | "thisYear"
              | "past7Days"
              | "past30Days",
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

      {range !== "all" && onDateChange && (
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
