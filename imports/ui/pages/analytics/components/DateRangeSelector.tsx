import React, { useState } from "react";
import { TimeFrame } from "../Analytics";

interface DateRangeSelectorProps {
  timeFrame: TimeFrame;
  onTimeFrameChange: (timeFrame: TimeFrame) => void;
  onCustomRangeChange?: (startDate: Date, endDate: Date) => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  timeFrame,
  onTimeFrameChange,
  onCustomRangeChange,
}) => {
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const timeFrameOptions: { value: TimeFrame; label: string }[] = [
    { value: "day", label: "Today" },
    { value: "week", label: "Last 7 Days" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
  ];

  const handleCustomRangeSubmit = () => {
    if (customStartDate && customEndDate && onCustomRangeChange) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      onCustomRangeChange(startDate, endDate);
      setShowCustomRange(false);
    }
  };

  const getMaxDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="flex items-center space-x-4">
      <label className="text-sm font-medium text-gray-700">Time Frame:</label>
      
      <select
        value={timeFrame}
        onChange={(e) => onTimeFrameChange(e.target.value as TimeFrame)}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-press-up-purple focus:border-press-up-purple"
      >
        {timeFrameOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        <option value="custom">Custom Range</option>
      </select>

      {timeFrame === "custom" && (
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            max={getMaxDate()}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-press-up-purple focus:border-press-up-purple"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            max={getMaxDate()}
            min={customStartDate}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-press-up-purple focus:border-press-up-purple"
          />
          <button
            onClick={handleCustomRangeSubmit}
            disabled={!customStartDate || !customEndDate}
            className="px-3 py-2 bg-press-up-purple text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}; 