import { Check, X } from "lucide-react";
import React from "react";
import { Button } from "./interaction/Button";

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
  onEditStaff?: (staffId: string) => void;
}

export const TrainingTable = ({
  staffRows,
  items,
  onEditStaff,
}: TrainingTableProps) => {
  return (
    <div className="w-full min-w-max">
      {/* Header */}
      <div className="flex sticky top-0 z-10 bg-white">
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
        {onEditStaff && (
          <div className="w-24 bg-press-up-light-purple py-1 px-2 border-y-2 border-press-up-light-purple rounded-r-lg flex items-center justify-center font-bold text-red-900 text-center">
            Edit
          </div>
        )}
      </div>
      {/* Body rows */}
      <div className="flex flex-col">
        {staffRows.length > 0 ? (
          staffRows.map((row) => (
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
                      className="flex-1 flex justify-center items-center select-none"
                      style={{
                        minWidth: "120px",
                        borderLeft: idx === 0 ? undefined : "1px solid #f3e8ff",
                      }}
                    >
                      {completed ? (
                        <Check className="text-press-up-purple" />
                      ) : (
                        <X className="text-press-up-grey" />
                      )}
                    </div>
                  );
                })}
              </div>
              {onEditStaff && (
                <div className="w-24 flex items-center justify-center">
                  <Button
                    variant="positive"
                    width="fit"
                    onClick={() => onEditStaff?.(row.id)}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-24 text-red-900 font-bold text-lg">
            No staff found
          </div>
        )}
      </div>
    </div>
  );
};
