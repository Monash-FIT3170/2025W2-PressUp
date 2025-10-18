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
  // Staff column
  const staffColumn: TableColumn<TrainingStaffRow> = {
    key: "name",
    header: "Staff",
    gridCol: "2fr",
    align: "left",
    render: (row) => <span className="truncate">{row.name}</span>,
  };

  // Edit column (if enabled)
  const editColumn: TableColumn<TrainingStaffRow> | null = onEditStaff
    ? {
        key: "edit",
        header: "Edit",
        gridCol: "min-content",
        align: "center" as const,
        render: (row) => (
          <Button
            variant="positive"
            className="w-fit"
            onClick={() => onEditStaff(row.id)}
          >
            Edit
          </Button>
        ),
      }
    : null;

  // Training item columns
  const itemColumns: TableColumn<TrainingStaffRow>[] = items.map((item) => ({
    key: item.id,
    header: item.name,
    gridCol: "1fr",
    align: "center" as const,
    render: (row) =>
      row.completedItems[item.id] ? (
        <Check className="text-press-up-purple mx-auto" />
      ) : (
        <X className="text-press-up-grey mx-auto" />
      ),
  }));

  // Compose columns: Staff, Edit (if any), then items
  const columns: TableColumn<TrainingStaffRow>[] = [
    staffColumn,
    ...(editColumn ? [editColumn] : []),
    ...itemColumns,
  ];

  return (
    <div className="flex flex-col h-full">
      <Table columns={columns} data={staffRows} emptyMessage="No staff found" />
    </div>
  );
};
