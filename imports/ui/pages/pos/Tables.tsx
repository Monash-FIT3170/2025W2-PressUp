import { Meteor } from "meteor/meteor";
import React, { useEffect, useState } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { TablesCollection } from "/imports/api/tables/TablesCollection";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useNavigate } from "react-router";
import { ConfirmModal } from "../../components/ConfirmModal";

// -------- Seat positioning helper --------
const getSeatPositions = (
  seatCount: number,
): { left: number; top: number }[] => {
  const positions = [];
  const radius = 85;
  const center = 68;
  for (let i = 0; i < seatCount; i++) {
    const angle = (2 * Math.PI * i) / seatCount;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    positions.push({ left: x, top: y });
  }
  return positions;
};

// -------- Types --------
interface Table {
  _id?: string;
  tableNo: number;
  capacity: number;
  noOccupants?: number;
  isOccupied?: boolean;
  activeOrderID?: string | null;
  orderIDs?: string[];
}

interface TableCardProps {
  table: Table;
  cardColour: string;
  isDragging: boolean;
  dragRef: React.Ref<HTMLDivElement>;
  onEdit: () => void;
}

// helper local type to avoid long inline intersection in casts
type TableWithOptionalOccupants = Table & { noOccupants?: number };

// -------- TableCard --------
const TableCard = ({
  table,
  cardColour,
  isDragging,
  dragRef,
  onEdit,
}: TableCardProps) => {
  const seatPositions = getSeatPositions(table?.capacity ?? 0);
  const occupied =
    typeof table.noOccupants === "number" ? table.noOccupants : 0;
  const capacity = table?.capacity ?? 0;
  const occupiedIndexes: number[] = [];
  if (occupied > 0 && capacity > 0) {
    const gap = capacity / occupied;
    for (let j = 0; j < occupied; j++) {
      occupiedIndexes.push(Math.round(j * gap));
    }
  }

  return (
    <div
      ref={dragRef}
      className={`${cardColour} border-2 shadow-md relative flex flex-col items-center justify-center cursor-move ${
        isDragging ? "opacity-50" : ""
      } rounded-full`}
      style={{ width: 140, height: 140 }}
    >
      {seatPositions.map((pos, i) => (
        <div
          key={i}
          className={`w-7 h-7 rounded-full border border-gray-500 absolute ${
            occupiedIndexes.includes(i)
              ? "bg-press-up-purple"
              : "bg-press-up-grey"
          }`}
          style={{
            left: pos.left,
            top: pos.top,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
      <span className="text-lg font-semibold mb-2 z-10">
        Table {table?.tableNo ?? ""}
      </span>
      <button
        onClick={onEdit}
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #6f597b",
          color: "#6f597b",
        }}
        className="text-xs px-2 py-1 rounded hover:bg-[#c4b5cf]"
      >
        Edit
      </button>
    </div>
  );
};

export const TablesPage = () => {
  const navigate = useNavigate();
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("POS System - Tables");
  }, [setPageTitle]);

  useSubscribe("tables");
  const tablesFromDb = useTracker(() =>
    TablesCollection.find({}, { sort: { tableNo: 1 } }).fetch(),
  );

  const MAX_NO_TABLES = 20;
  const GRID_COLS = 5;
  const GRID_ROWS = Math.ceil(MAX_NO_TABLES / GRID_COLS);
  const GRID_SIZE = GRID_ROWS * GRID_COLS;

  // Single grid state
  const [grid, setGrid] = useState<(Table | null)[]>(
    Array(GRID_SIZE).fill(null),
  );
  const [originalGrid, setOriginalGrid] = useState<(Table | null)[] | null>(
    null,
  );

  const [editMode, setEditMode] = useState(false);
  const userIsAdmin = Meteor.user()?.username === "admin";
  const [hasChanges, setHasChanges] = useState(false);

  const [modalType, setModalType] = useState<
    null | "addTable" | "editTable" | "exitConfirm" | "deleteTable"
  >(null);
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(
    null,
  );
  const [editTableData, setEditTableData] = useState<Table | null>(null);
  const [capacityInput, setCapacityInput] = useState("");
  const [occupancyInput, setOccupancyInput] = useState("");
  const [occupiedToggle, setOccupiedToggle] = useState(false);
  const [modalOriginalTable, setModalOriginalTable] = useState<Table | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("");
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [clearOrderOnSave, setClearOrderOnSave] = useState(false);
  const [deleteTableInput, setDeleteTableInput] = useState("");

  // Prefill grid with tables from DB on initial load
  useEffect(() => {
    if (tablesFromDb.length > 0 && grid.every((cell) => cell === null)) {
      const newGrid = Array(GRID_SIZE).fill(null);
      tablesFromDb.forEach((table, idx) => {
        if (idx < GRID_SIZE) {
          newGrid[idx] = table;
        }
      });
      setGrid(newGrid);
    }
  }, [tablesFromDb, grid, GRID_SIZE]);

  const markChanged = () => setHasChanges(true);

  const moveTable = (fromIdx: number, toIdx: number) => {
    const updated = [...grid];
    updated[toIdx] = updated[fromIdx];
    updated[fromIdx] = null;
    setGrid(updated);
    markChanged();
  };

  // -------- GridCell --------
  const GridCell = ({
    table,
    cellIndex,
  }: {
    table: Table | null;
    cellIndex: number;
  }) => {
    const [{ isOver, canDrop }, drop] = useDrop({
      accept: "TABLE",
      canDrop: () => editMode && grid[cellIndex] === null,
      drop: (item: { index: number }) => {
        if (!editMode) return;
        moveTable(item.index, cellIndex);
        item.index = cellIndex;
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    });

    const [{ isDragging }, drag] = useDrag({
      type: "TABLE",
      item: { index: cellIndex },
      canDrag: !!table && editMode,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <div
        ref={drop as unknown as React.Ref<HTMLDivElement>}
        className={`relative flex items-center justify-center border border-gray-300 bg-white rounded-full min-h-[150px] min-w-[150px] ${
          isOver && canDrop ? "bg-purple-100" : ""
        }`}
        style={{ height: 150, width: 150 }}
      >
        {table ? (
          <TableCard
            table={table}
            cardColour={
              table.isOccupied ? "bg-press-up-light-purple" : "bg-press-up-grey"
            }
            isDragging={isDragging}
            dragRef={drag as unknown as React.Ref<HTMLDivElement>}
            onEdit={() => {
              // open modal and capture a snapshot of the table so Cancel can revert
              setEditTableData(table);
              setModalOriginalTable(table);
              setModalType("editTable");
            }}
          />
        ) : editMode ? (
          <button
            onClick={() => {
              setSelectedCellIndex(cellIndex);
              setModalType("addTable");
            }}
            style={{ color: "#6f597b" }}
            className="text-4xl hover:text-[#1e032e] transition"
          >
            +
          </button>
        ) : null}
      </div>
    );
  };

  // -------- Edit mode handling --------
  const enterEditMode = () => {
    setOriginalGrid(JSON.parse(JSON.stringify(grid)));
    setEditMode(true);
    setHasChanges(false);
  };

  const saveChanges = () => {
    setHasChanges(false);
    setEditMode(false);
    setOriginalGrid(null);
  };

  const discardChanges = () => {
    if (originalGrid) {
      setGrid(originalGrid);
    }
    setHasChanges(false);
    setEditMode(false);
    setModalType(null);
  };

  const exitEditMode = () => {
    if (hasChanges) {
      setModalType("exitConfirm");
    } else {
      setEditMode(false);
    }
  };

  const goToOrder = (tableNo?: number) => {
    if (tableNo !== null) {
      navigate(`/pos/orders?tableNo=${tableNo}`);
    } else {
      navigate("/pos/orders");
    }
  };

  // initialize modal-local fields from snapshot when opening edit modal
  useEffect(() => {
    if (modalType === "editTable" && modalOriginalTable) {
      setEditTableData(modalOriginalTable);
      setCapacityInput(modalOriginalTable.capacity.toString());
      setOccupancyInput(modalOriginalTable.noOccupants?.toString() ?? "");
      setOccupiedToggle(!!modalOriginalTable.isOccupied);
    }
    if (modalType === null) {
      // clean up snapshot when modal closes
      setModalOriginalTable(null);
    }
  }, [modalType, modalOriginalTable]);

  // -------- Render --------
  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className="p-6 overflow-y-auto w-full"
        style={{ maxHeight: "calc(100vh - 100px)" }}
      >
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <div className="flex gap-4 items-center">
            {userIsAdmin &&
              (editMode ? (
                <div className="flex gap-2">
                  <button
                    onClick={saveChanges}
                    style={{ backgroundColor: "#6f597b", color: "#fff" }}
                    className="px-4 py-1 rounded hover:bg-[#c4b5cf] hover:text-[#1e032e]"
                  >
                    Save
                  </button>
                  <button
                    onClick={exitEditMode}
                    style={{ backgroundColor: "#c97f97", color: "#fff" }}
                    className="px-4 py-1 rounded hover:brightness-90"
                  >
                    Exit Edit Mode
                  </button>
                </div>
              ) : (
                <button
                  onClick={enterEditMode}
                  style={{ backgroundColor: "#1e032e", color: "#fff" }}
                  className="px-4 py-1 rounded hover:bg-[#6f597b]"
                >
                  Enter Edit Mode
                </button>
              ))}
            {/* Legend - always visible */}
            <div className="flex gap-4 ml-6">
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-press-up-purple border border-gray-500"></div>
                <span className="text-sm">Occupied</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-press-up-grey border border-gray-500"></div>
                <span className="text-sm">Not Occupied</span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Table & Delete Table Buttons */}
        {editMode && (
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => {
                setSelectedCellIndex(null);
                setModalType("addTable");
              }}
              style={{ backgroundColor: "#6f597b", color: "#fff" }}
              className="px-4 py-1 rounded hover:bg-[#c4b5cf] hover:text-[#1e032e]"
            >
              + Add Table
            </button>
            <button
              onClick={() => {
                setDeleteTableInput("");
                setModalType("deleteTable");
              }}
              style={{ backgroundColor: "#c97f97", color: "#fff" }}
              className="px-4 py-1 rounded hover:brightness-90"
            >
              - Delete Table
            </button>
          </div>
        )}

        {/* Table grid */}
        <div className="grid grid-cols-5 gap-16 p-4 justify-items-center">
          {grid.map((table, idx) => (
            <GridCell key={idx} table={table} cellIndex={idx} />
          ))}
        </div>
      </div>

      {/* -------- Modals -------- */}
      {modalType && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            {/* Add Table */}
            {modalType === "addTable" && (
              <>
                <h2 className="text-lg font-semibold mb-4">Add Table</h2>
                <label
                  htmlFor="edit-table-capacity"
                  className="block mb-2 text-sm font-medium text-red-900 dark:text-black"
                >
                  Capacity
                </label>
                <input
                  type="number"
                  value={capacityInput}
                  onChange={(e) => setCapacityInput(e.target.value)}
                  className="w-full border rounded px-2 py-1 mb-4"
                  placeholder="Number of seats"
                  min={1}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={async () => {
                      if (
                        !capacityInput ||
                        isNaN(Number(capacityInput)) ||
                        Number(capacityInput) < 1
                      ) {
                        alert(
                          "Please enter a valid number of seats (must be at least 1).",
                        );
                        return;
                      }
                      const updated = [...grid];
                      let idx = selectedCellIndex;
                      if (idx === null) {
                        idx = updated.findIndex((cell) => cell === null);
                      }
                      if (idx !== -1) {
                        const nextTableNo =
                          Math.max(
                            0,
                            ...grid
                              .filter((t) => t !== null)
                              .map((t) => t!.tableNo),
                          ) + 1;
                        const newTable = {
                          tableNo: nextTableNo,
                          capacity: parseInt(capacityInput, 10),
                          isOccupied: false,
                          orderID: null,
                          noOccupants: 0,
                        };
                        updated[idx] = newTable;
                        setGrid(updated);
                        setModalType(null);
                        setCapacityInput("");
                        markChanged();
                        await Meteor.callAsync("tables.addTable", newTable);
                      }
                    }}
                    style={{ backgroundColor: "#6f597b", color: "#fff" }}
                    className="px-4 py-1 rounded hover:bg-[#c4b5cf] hover:text-[#1e032e]"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setModalType(null)}
                    style={{
                      backgroundColor: "#fff",
                      border: "1px solid #6f597b",
                      color: "#6f597b",
                    }}
                    className="px-4 py-1 rounded hover:bg-[#c4b5cf]"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* Edit Table */}
            {modalType === "editTable" && editTableData && (
              <>
                <h2 className="text-lg font-semibold mb-4">
                  Edit Table {editTableData!.tableNo}
                </h2>
                <label
                  htmlFor="edit-table-capacity"
                  className="block mb-2 text-sm font-medium text-red-900 dark:text-black"
                >
                  Capacity
                </label>
                <input
                  id="edit-table-capacity"
                  type="number"
                  value={capacityInput}
                  onChange={(e) => setCapacityInput(e.target.value)}
                  className="w-full border rounded px-2 py-1 mb-4"
                  placeholder="Number of seats"
                  min={1}
                />
                {occupiedToggle && (
                  <>
                    <label
                      htmlFor="edit-table-occupancy"
                      className="block mb-2 text-sm font-medium text-red-900 dark:text-black"
                    >
                      Number of Occupants
                    </label>
                    <input
                      id="edit-table-occupancy"
                      type="number"
                      value={occupancyInput}
                      onChange={(e) => setOccupancyInput(e.target.value)}
                      className="w-full border rounded px-2 py-1 mb-4"
                      placeholder="Number of occupants"
                      min={1}
                    />
                  </>
                )}
                {/* Top row: Add Order + Occupied toggle */}
                <div className="flex justify-between items-center gap-2 mb-3">
                  {/* Add Order Button */}
                  <button
                    onClick={async () => {
                      try {
                        const dbTable = tablesFromDb.find(
                          (t) => t.tableNo === editTableData!.tableNo,
                        );
                        if (!dbTable || !dbTable._id) {
                          alert("Could not find table in database.");
                          return;
                        }

                        // Create new order (only if no existing one, because we disable otherwise)
                        const orderId = await Meteor.callAsync(
                          "orders.addOrder",
                          {
                            orderNo: Math.floor(1000 + Math.random() * 9000),
                            tableNo: editTableData!.tableNo,
                            menuItems: [],
                            totalPrice: 0,
                            createdAt: new Date(),
                            orderStatus: "pending",
                            paid: false,
                          },
                        );

                        // Link order to table
                        await Meteor.callAsync(
                          "tables.addOrder",
                          dbTable._id,
                          orderId,
                        );

                        // Update local grid
                        const updated = grid.map((t) =>
                          t?.tableNo === editTableData!.tableNo
                            ? {
                                ...t,
                                isOccupied: true,
                                orderID: String(orderId),
                              }
                            : t,
                        );
                        setGrid(updated);
                        setModalType(null);
                        markChanged();
                        goToOrder(editTableData!.tableNo);
                      } catch (err) {
                        console.error("Error adding order:", err);
                        alert(
                          "Failed to add order. Check console for details.",
                        );
                      }
                    }}
                    disabled={
                      !!tablesFromDb.find(
                        (t) =>
                          t.tableNo === editTableData!.tableNo &&
                          t.activeOrderID,
                      )
                    } // disable if table already has active order
                    style={{
                      backgroundColor: tablesFromDb.find(
                        (t) =>
                          t.tableNo === editTableData!.tableNo &&
                          t.activeOrderID,
                      )
                        ? "#ccc"
                        : "#6f597b",
                      color: "#fff",
                      cursor: tablesFromDb.find(
                        (t) =>
                          t.tableNo === editTableData!.tableNo &&
                          t.activeOrderID,
                      )
                        ? "not-allowed"
                        : "pointer",
                    }}
                    className="px-4 py-1 rounded hover:bg-[#c4b5cf] hover:text-[#1e032e]"
                  >
                    Add Order
                  </button>

                  {/* Occupied toggle */}
                  <button
                    onClick={() => {
                      const newOccupied = !occupiedToggle;
                      // if we're marking vacant and there's an existing order, confirm first
                      const dbTable = tablesFromDb.find(
                        (t) => t.tableNo === editTableData!.tableNo,
                      );
                      const hasOrder = !!(
                        dbTable?.activeOrderID ||
                        editTableData?.activeOrderID ||
                        modalOriginalTable?.activeOrderID
                      );
                      if (!newOccupied && hasOrder) {
                        setConfirmMsg(
                          "This will remove the linked order and mark the table as vacant. Continue?",
                        );
                        setConfirmAction(() => () => {
                          setOccupiedToggle(false);
                          setOccupancyInput("");
                          setClearOrderOnSave(true);
                          setConfirmOpen(false);
                        });
                        setConfirmOpen(true);
                        return;
                      }
                      setOccupiedToggle(newOccupied);
                      if (!newOccupied) {
                        // hide/clear occupancy input when marking vacant
                        setOccupancyInput("");
                        setClearOrderOnSave(false);
                      } else if (!occupancyInput) {
                        // default to 1 occupant when marking occupied and no value present
                        setOccupancyInput("1");
                        setClearOrderOnSave(false);
                      }
                    }}
                    aria-pressed={occupiedToggle}
                    aria-label={occupiedToggle ? "Set Vacant" : "Set Occupied"}
                    style={{
                      backgroundColor: occupiedToggle ? "#c97f97" : "#6f597b",
                      color: "#fff",
                      minWidth: 110,
                    }}
                    className="px-4 py-1 rounded"
                  >
                    {occupiedToggle ? "Occupied" : "Vacant"}
                  </button>
                </div>

                {/* Bottom row: Cancel & Save */}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      // discard modal-local changes: restore snapshot
                      setModalType(null);
                      if (modalOriginalTable) {
                        setCapacityInput(
                          modalOriginalTable.capacity.toString(),
                        );
                        setOccupancyInput(
                          modalOriginalTable.noOccupants?.toString() ?? "",
                        );
                        setOccupiedToggle(!!modalOriginalTable.isOccupied);
                      } else {
                        setCapacityInput("");
                        setOccupancyInput("");
                        setOccupiedToggle(false);
                      }
                    }}
                    style={{
                      backgroundColor: "#fff",
                      border: "1px solid #6f597b",
                      color: "#6f597b",
                    }}
                    className="px-4 py-1 rounded hover:bg-[#c4b5cf]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (
                        !capacityInput ||
                        isNaN(Number(capacityInput)) ||
                        Number(capacityInput) < 1
                      ) {
                        alert(
                          "Please enter a valid number of seats (must be at least 1).",
                        );
                        return;
                      } else if (
                        isNaN(Number(occupancyInput)) ||
                        Number(occupancyInput) > Number(capacityInput)
                      ) {
                        alert(
                          "Please enter a valid number of occupants (cannot exceed capacity).",
                        );
                      }
                      const updated = grid.map((t) => {
                        if (t?.tableNo !== editTableData!.tableNo) return t;
                        const base = {
                          ...t,
                          capacity: parseInt(capacityInput, 10),
                        } as TableWithOptionalOccupants;
                        if (occupiedToggle) {
                          return {
                            ...base,
                            isOccupied: true,
                            noOccupants: parseInt(occupancyInput, 10),
                          };
                        }
                        // vacant: remove local noOccupants and mark not occupied
                        const copy = { ...base } as TableWithOptionalOccupants;
                        copy.isOccupied = false;
                        delete copy.noOccupants;
                        // also clear any local order link
                        copy.activeOrderID = null;
                        return copy;
                      });
                      setGrid(updated);
                      setModalType(null);
                      setCapacityInput("");
                      setOccupancyInput("");
                      markChanged();
                      const dbTable = tablesFromDb.find(
                        (t) => t.tableNo === editTableData!.tableNo,
                      );
                      if (dbTable && dbTable._id) {
                        // persist capacity first
                        await Meteor.callAsync(
                          "tables.changeCapacity",
                          dbTable._id,
                          parseInt(capacityInput, 10),
                        );
                        // persist occupancy and order state
                        try {
                          if (!occupiedToggle) {
                            // We are marking vacant. If there is an order, clear it too.
                            if (dbTable.activeOrderID || clearOrderOnSave) {
                              await Meteor.callAsync(
                                "tables.clearOrder",
                                dbTable._id,
                              );
                            } else {
                              await Meteor.callAsync(
                                "tables.setOccupied",
                                dbTable._id,
                                false,
                                0,
                              );
                            }
                          } else {
                            await Meteor.callAsync(
                              "tables.setOccupied",
                              dbTable._id,
                              true,
                              parseInt(occupancyInput || "0", 10),
                            );
                          }
                          // clear snapshot after successful save
                          setModalOriginalTable(null);
                          setClearOrderOnSave(false);
                        } catch (err) {
                          console.error(
                            "Failed to persist occupancy/order on save:",
                            err,
                          );
                        }
                      }
                    }}
                    style={{ backgroundColor: "#1e032e", color: "#fff" }}
                    className="px-4 py-1 rounded hover:bg-[#6f597b]"
                  >
                    Save
                  </button>
                </div>
              </>
            )}

            {/* Confirmation Modal */}
            <ConfirmModal
              open={confirmOpen}
              message={confirmMsg}
              onConfirm={() => {
                if (confirmAction) confirmAction();
              }}
              onCancel={() => setConfirmOpen(false)}
            />

            {/* Delete Table Modal */}
            {modalType === "deleteTable" && (
              <>
                <h2 className="text-lg font-semibold mb-4">Delete Table</h2>
                <input
                  type="number"
                  value={deleteTableInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) setDeleteTableInput(val);
                  }}
                  className="w-full border rounded px-2 py-1 mb-4"
                  placeholder="Enter table number to delete"
                  min={1}
                  inputMode="numeric"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={async () => {
                      const tableNo = Number(deleteTableInput);
                      if (!deleteTableInput || isNaN(tableNo) || tableNo < 1) {
                        alert("Please enter a valid table number.");
                        return;
                      }
                      const idx = grid.findIndex(
                        (t) => t && t.tableNo === tableNo,
                      );
                      if (idx === -1) {
                        alert("Table not found.");
                        return;
                      }
                      const updated = [...grid];
                      updated[idx] = null;
                      setGrid(updated);
                      setModalType(null);
                      setDeleteTableInput("");
                      markChanged();
                      // Remove from DB
                      const dbTable = tablesFromDb.find(
                        (t) => t.tableNo === tableNo,
                      );
                      if (dbTable && dbTable._id) {
                        await Meteor.callAsync(
                          "tables.removeTable",
                          dbTable._id,
                        );
                      }
                    }}
                    style={{ backgroundColor: "#c97f97", color: "#fff" }}
                    className="px-4 py-1 rounded hover:brightness-90"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setModalType(null)}
                    style={{
                      backgroundColor: "#fff",
                      border: "1px solid #6f597b",
                      color: "#6f597b",
                    }}
                    className="px-4 py-1 rounded hover:bg-[#c4b5cf]"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* Exit Confirm */}
            {modalType === "exitConfirm" && (
              <>
                <h2 className="text-lg font-semibold mb-4">Unsaved Changes</h2>
                <p>
                  You have unsaved changes. Would you like to save before
                  exiting?
                </p>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => {
                      saveChanges();
                      setModalType(null);
                    }}
                    style={{ backgroundColor: "#6f597b", color: "#fff" }}
                    className="px-4 py-1 rounded hover:bg-[#c4b5cf] hover:text-[#1e032e]"
                  >
                    Save & Exit
                  </button>
                  <button
                    onClick={discardChanges}
                    style={{ backgroundColor: "#c97f97", color: "#fff" }}
                    className="px-4 py-1 rounded hover:brightness-90"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={() => setModalType(null)}
                    style={{
                      backgroundColor: "#fff",
                      border: "1px solid #6f597b",
                      color: "#6f597b",
                    }}
                    className="px-4 py-1 rounded hover:bg-[#c4b5cf]"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DndProvider>
  );
};
