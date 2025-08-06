import { Meteor } from "meteor/meteor";
import React, { useEffect, useState } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { OrdersCollection } from "/imports/api/orders/OrdersCollection";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
// Helper to get seat positions around a square
const getSeatPositions = (seatCount: number): { left: number; top: number }[] => {
  const positions = [];
  const radius = 85;
  const center = 70;
  for (let i = 0; i < seatCount; i++) {
    const angle = (2 * Math.PI * i) / seatCount;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    positions.push({ left: x, top: y });
  }
  return positions;
};

interface Table {
  tableNo: number;
  seats?: number;
  orderStatus?: string;
  paid?: boolean;
}

interface TableCardProps {
  table: Table;
  paidColor: string;
  isDragging: boolean;
  dragRef: React.Ref<HTMLDivElement>;
}

const TableCard = ({ table, paidColor, isDragging, dragRef }: TableCardProps) => {
  // Seats around border
  const seatPositions = getSeatPositions(table?.seats ?? 0);
  return (
    <div
      ref={dragRef}
      className={`${paidColor} border-2 shadow-md relative flex flex-col items-center justify-center cursor-move ${isDragging ? "opacity-50" : ""} rounded-full`}
      style={{ width: 140, height: 140 }}
    >
      {/* Seats around border */}
      {seatPositions.map((pos, i) => (
        <div
          key={i}
          className="w-7 h-7 rounded-full bg-gray-300 border border-gray-500 absolute"
          style={{ left: pos.left, top: pos.top, transform: "translate(-50%, -50%)" }}
        />
      ))}
      <span className="text-lg font-semibold mb-2 z-10">Table {table?.tableNo ?? ""}</span>
      <span className="text-xs text-gray-500 z-10">Status: {table?.orderStatus || "Unknown"}</span>
    </div>
  );
};

export const TablesPage = () => {
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => { setPageTitle("POS System - Tables"); }, [setPageTitle]);
  useSubscribe("orders");
  const tablesFromDb = useTracker(() =>
    OrdersCollection.find({}, { sort: { tableNo: 1 } }).fetch()
  );
  const paidColour = (paid: boolean) => {
    return paid ? "bg-green-100" : "bg-red-100";
  };

  // Grid size
  const GRID_ROWS = 3;
  const GRID_COLS = 5;
  const GRID_SIZE = GRID_ROWS * GRID_COLS;

  // Map tables to grid positions (initially fill from DB, rest empty)
  const [grid, setGrid] = useState(Array(GRID_SIZE).fill(null));
  useEffect(() => {
    // Only update grid if tablesFromDb has changed in length or tableNo
    if (tablesFromDb.length === 0) return;
    const gridTables = grid.filter(Boolean) as Table[];
    const dbTableNos = tablesFromDb.map(t => t.tableNo).sort();
    const gridTableNos = gridTables.map(t => t.tableNo).sort();
    if (JSON.stringify(dbTableNos) === JSON.stringify(gridTableNos)) return;
    // Place tables at start of grid, rest empty
    const newGrid = Array(GRID_SIZE).fill(null);
    tablesFromDb.forEach((table, i) => {
      newGrid[i] = table;
    });
    setGrid(newGrid);
  }, [tablesFromDb]);

  // Drag-and-drop logic for grid cells
  const moveTable = (fromIdx: number, toIdx: number) => {
    setGrid(prev => {
      const updated = [...prev];
      updated[toIdx] = updated[fromIdx];
      updated[fromIdx] = null;
      return updated;
    });
  };

  // Grid cell component
  interface GridCellProps {
    table: Table | null;
    cellIndex: number;
  }
  const GridCell = ({ table, cellIndex }: GridCellProps) => {
    // Drop target
    const [{ isOver, canDrop }, drop] = useDrop({
      accept: "TABLE",
      canDrop: () => grid[cellIndex] === null,
      drop: (item: { index: number }) => {
        moveTable(item.index, cellIndex);
        item.index = cellIndex;
      },
      collect: monitor => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    });
    // Drag source (only if table exists)
    const [{ isDragging }, drag] = useDrag({
      type: "TABLE",
      item: { index: cellIndex },
      canDrag: !!table,
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
    });
    return (
      <div
        ref={drop as unknown as React.Ref<HTMLDivElement>}
        className={`relative flex items-center justify-center border border-gray-300 bg-gray-50 rounded-full min-h-[150px] min-w-[150px] ${isOver && canDrop ? "bg-blue-100" : ""}`}
        style={{ height: 150, width: 150 }}
      >
        {table ? (
          <TableCard
            table={table}
            paidColor={paidColour(table.paid ?? false)}
            isDragging={isDragging}
            dragRef={drag as unknown as React.Ref<HTMLDivElement>}
          />
        ) : null}
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-8">
        <div className="grid grid-cols-5 gap-20">
          {grid.map((table, idx) => (
            <GridCell key={idx} table={table} cellIndex={idx} />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};