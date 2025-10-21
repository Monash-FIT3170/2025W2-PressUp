import React from "react";
import { Check, X } from "lucide-react";
import { Button } from "./interaction/Button";
import { Table, TableColumn } from "./Table";

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
  onEditStaff?: (staffId: string) => void;
}

export const TrainingTable = ({
  staffRows,
  items,
  onEditStaff,
}: TrainingTableProps) => {
  // Define columns for Table
  const columns: TableColumn<TrainingStaffRow>[] = [
    {
      key: "name",
      header: "Staff",
      gridCol: "2fr",
      align: "left",
      render: (row) => <span className="truncate">{row.name}</span>,
    },
    ...items.map((item) => ({
      key: item.id,
      header: item.name,
      gridCol: "1fr",
      align: "center" as const,
      render: (row: { completedItems: { [x: string]: any } }) =>
        row.completedItems[item.id] ? (
          <Check className="text-press-up-purple mx-auto" />
        ) : (
          <X className="text-press-up-grey mx-auto" />
        ),
    })),
    ...(onEditStaff
      ? [
          {
            key: "edit",
            header: "Edit",
            gridCol: "min-content",
            align: "center" as const,
            render: (row: { id: string }) => (
              <Button
                variant="positive"
                className="w-fit"
                onClick={() => onEditStaff(row.id)}
              >
                Edit
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col h-full">
      <Table columns={columns} data={staffRows} emptyMessage="No staff found" />
    </div>
  );
};
