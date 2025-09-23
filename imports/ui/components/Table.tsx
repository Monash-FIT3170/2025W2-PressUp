import React from "react";
import clsx from "clsx";

const Divider = () => (
  <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
);

export interface TableColumn<T = any> {
  key: string;
  header: React.ReactNode;
  gridCol: string;
  align?: "left" | "center" | "right";
  render: (item: T, index: number) => React.ReactNode;
}

interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
}

export const Table = <T,>({
  columns,
  data,
  emptyMessage = "No data available",
}: TableProps<T>) => {
  if (data.length === 0) {
    return (
      <h2 className="flex-1 text-center font-bold text-xl text-red-900">
        {emptyMessage}
      </h2>
    );
  }

  const gridCols = columns.map((col) => col.gridCol).join(" ");

  return (
    <div id="grid-container" className="overflow-auto flex-1">
      <div
        className="grid gap-y-2 text-nowrap text-center text-red-900"
        style={{ gridTemplateColumns: gridCols }}
      >
        {columns.map((column, index) => {
          const isFirst = index === 0;
          const isLast = index === columns.length - 1;

          return (
            <div
              key={column.key}
              className={clsx(
                "bg-press-up-light-purple py-1 px-2 border-y-3 border-press-up-light-purple sticky top-0 z-1",
                column.align === "left" && "text-left",
                column.align === "right" && "text-right",
                isFirst && "rounded-l-lg",
                isLast && "rounded-r-lg",
              )}
            >
              {column.header}
              {!isLast && <Divider />}
            </div>
          );
        })}

        {data.flatMap((item, rowIndex) =>
          columns.map((column, colIndex) => {
            const isLast = colIndex === columns.length - 1;

            return (
              <div
                key={`${rowIndex}-${column.key}`}
                className={clsx(
                  "relative py-1 px-2",
                  column.align === "left" && "text-left",
                  column.align === "right" && "text-right",
                )}
              >
                {column.render(item, rowIndex)}
                {!isLast && <Divider />}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
};
