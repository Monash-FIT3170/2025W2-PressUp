import React from "react";

interface TrainingItem {
  id: string;
  name: string;
}

interface TrainingStaffRow {
  id: string;
  name: string;
  completedItems: { [itemId: string]: boolean };
}

interface TrainingTableProps {
  staffRows: TrainingStaffRow[];
  items: TrainingItem[];
  onCheckboxChange?: (staffId: string, itemId: string) => void;
}

export const TrainingTable = ({
  staffRows,
  items,
  onCheckboxChange,
}: TrainingTableProps) => {
  return (
    <div className="h-full flex flex-col">
      {/* Sticky header with training items */}
      <div className="flex shrink-0 sticky top-0 z-10">
        <div className="w-36 bg-press-up-light-purple py-1 px-2 border-y-2 border-press-up-light-purple rounded-l-lg flex items-center justify-center font-bold text-red-900">
          Staff
        </div>
        <div className="flex-1 flex">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="flex-1 bg-press-up-light-purple py-1 px-2 border-y-2 border-press-up-light-purple font-bold text-red-900 text-center"
              style={{
                minWidth: "120px",
                borderLeft: idx === 0 ? undefined : "1px solid #d1aaff",
              }}
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>
      {/* Staff rows */}
      <div className="flex-1 overflow-y-auto">
        {staffRows.map((row) => (
          <div
            key={row.id}
            className="flex items-center h-12 border-b border-gray-200"
          >
            <div className="w-36 px-4 py-1 font-medium text-red-900 relative flex items-center h-12">
              <span className="truncate">{row.name}</span>
              <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
            </div>
            <div className="flex-1 flex">
              {items.map((item, idx) => {
                const completed = !!row.completedItems[item.id];
                return (
                  <div
                    key={item.id}
                    className="flex-1 flex justify-center items-center"
                    style={{
                      minWidth: "120px",
                      borderLeft: idx === 0 ? undefined : "1px solid #f3e8ff",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={completed}
                      className="cursor-pointer accent-press-up-purple"
                      onChange={() => onCheckboxChange?.(row.id, item.id)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {staffRows.length === 0 && (
          <div className="flex items-center justify-center h-24 text-red-900 font-bold text-lg">
            No staff found
          </div>
        )}
      </div>
    </div>
  );
};
