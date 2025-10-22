import { Meteor } from "meteor/meteor";
import React, { useEffect, useState } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { 
  TablesCollection,
  TableBooking
 } from "/imports/api/tables/TablesCollection";
import {
  OrdersCollection,
  OrderType,
} from "/imports/api/orders/OrdersCollection";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useNavigate } from "react-router";
import { Roles } from "meteor/alanning:roles";
import { RoleEnum } from "/imports/api/accounts/roles";
import { Hide } from "../../components/display/Hide";
import { ConfirmModal } from "../../components/ConfirmModal";
import { Button } from "../../components/interaction/Button";

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
  bookings?: TableBooking[];
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

  // Non-assigned dine-in orders for dropdown
  useSubscribe("orders");
  const orders = useTracker(() =>
    OrdersCollection.find({}, { sort: { orderNo: 1 } }).fetch(),
  );

  const MAX_NO_TABLES = 20;
  const GRID_COLS = 5;
  const GRID_ROWS = Math.ceil(MAX_NO_TABLES / GRID_COLS);
  const GRID_SIZE = GRID_ROWS * GRID_COLS;
  const MAX_TABLE_CAPACITY = 12;

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
    null | "addTable" | "editTable" | "exitConfirm" | "deleteTable" | "addBooking"
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
  const [selectedMoveTableNo, setSelectedMoveTableNo] = useState<string | null>(
    null,
  );
  const [selectedMoveOrderNo, setSelectedMoveOrderNo] = useState<string | null>(
    null,
  );

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    customerName: "",
    customerPhone: "",
    partySize: "",
    bookingDate: "",
    notes: "",
  });
  const resetBookingForm = () => {
    setBookingForm({
      customerName: "",
      customerPhone: "",
      partySize: "",
      bookingDate: "",
      notes: "",
    });
  };

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

  const rolesLoaded = useSubscribe("users.roles")();
  const rolesGraphLoaded = useSubscribe("users.rolesGraph")();
  const canEditLayout = useTracker(
    () => Roles.userIsInRole(Meteor.userId(), [RoleEnum.MANAGER]),
    [rolesLoaded, rolesGraphLoaded],
  );

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
    if (!Roles.userIsInRole(Meteor.userId(), [RoleEnum.MANAGER])) {
      throw new Meteor.Error(
        "invalid-permissions",
        "No permissions to edit table layout.",
      );
    }

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

  const goToOrder = (orderId?: string) => {
    if (orderId) {
      sessionStorage.setItem("activeOrderId", orderId);
    }
    navigate("/pos/orders");
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
                  <Button variant="negative" onClick={saveChanges}>
                    Save
                  </Button>
                  <Button variant="positive" onClick={exitEditMode}>
                    Exit Edit Mode
                  </Button>
                </div>
              ) : (
                <Hide hide={!canEditLayout}>
                  <Button variant="positive" onClick={enterEditMode}>
                    Enter Edit Mode
                  </Button>
                </Hide>
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
            <Button
              variant="negative"
              onClick={() => {
                // open Add Table modal; do not add anything here
                setSelectedCellIndex(null);
                setCapacityInput("");
                setModalType("addTable");
              }}
            >
              + Add Table
            </Button>
            <Button
              variant="positive"
              onClick={() => {
                setDeleteTableInput("");
                setModalType("deleteTable");
              }}
            >
              - Delete Table
            </Button>
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
                  max={MAX_TABLE_CAPACITY}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="negative"
                    onClick={async () => {
                      // validate 1..MAX_TABLE_CAPACITY
                      if (
                        !capacityInput ||
                        isNaN(Number(capacityInput)) ||
                        Number(capacityInput) < 1 ||
                        Number(capacityInput) > MAX_TABLE_CAPACITY // <-- missing check
                      ) {
                        alert(
                          `Please enter a valid number of seats (between 1 and ${MAX_TABLE_CAPACITY}).`,
                        );
                        return;
                      }

                      // pick a cell index to place the new table
                      const updated = [...grid];
                      let idx = selectedCellIndex;
                      if (idx === null)
                        idx = updated.findIndex((cell) => cell === null);
                      if (idx === -1) {
                        alert("No empty slot available.");
                        return;
                      }

                      // compute next available tableNo
                      const usedTableNos = grid
                        .filter(Boolean)
                        .map((t) => (t as Table).tableNo);
                      let nextTableNo = 1;
                      while (usedTableNos.includes(nextTableNo)) nextTableNo++;

                      const newTable = {
                        tableNo: nextTableNo,
                        capacity: parseInt(capacityInput, 10),
                        isOccupied: false,
                        orderID: null,
                        noOccupants: 0,
                      };

                      try {
                        // 1) write to server first (server enforces 1..12 too)
                        await Meteor.callAsync("tables.addTable", newTable);

                        // 2) only if success, update UI
                        updated[idx] = newTable;
                        setGrid(updated);
                        setModalType(null);
                        setCapacityInput("");
                        markChanged();
                      } catch (err: any) {
                        // If server rejects, do not change UI
                        alert(
                          err?.reason || err?.message || "Failed to add table.",
                        );
                      }
                    }}
                  >
                    Add
                  </Button>
                  <Button variant="positive" onClick={() => setModalType(null)}>
                    Cancel
                  </Button>
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
                  max={12}
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
                {/* Top row: Occupied toggle */}
                <div
                  className={`flex items-center gap-2 mb-3 ${
                    tablesFromDb.find(
                      (t) =>
                        t.tableNo === editTableData!.tableNo && t.activeOrderID,
                    )
                      ? "justify-between"
                      : "justify-end"
                  }`}
                >
                  {/* Go to Order button (only displays for Table which has an active order) */}
                  {(() => {
                    const order = editTableData?.activeOrderID
                      ? orders.find(
                          (o) => o._id === editTableData.activeOrderID,
                        )
                      : null;
                    if (!order) return null;
                    return (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => {
                            goToOrder(String(editTableData?.activeOrderID));
                          }}
                          variant="positive"
                        >
                          {`Go to Order #${order.orderNo}`}
                        </Button>
                      </div>
                    );
                  })()}
                  {/* Occupied/Vacant Toggle */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => {
                        if (!occupiedToggle) {
                          setOccupiedToggle(true);
                          setOccupancyInput(occupancyInput || "1");
                        } else {
                          // If marking vacant and there's an active order, confirm
                          const dbTable = tablesFromDb.find(
                            (t) => t.tableNo === editTableData!.tableNo,
                          );
                          const hasOrder = !!(
                            dbTable?.activeOrderID ||
                            editTableData?.activeOrderID ||
                            modalOriginalTable?.activeOrderID
                          );
                          if (hasOrder) {
                            setConfirmMsg(
                              "This will remove the linked order and mark the table as vacant. Continue?",
                            );
                            setConfirmAction(() => async () => {
                              setOccupiedToggle(false);
                              setOccupancyInput("");
                              setClearOrderOnSave(true);
                              setConfirmOpen(false);

                              // Clear the table's activeOrderID in the DB
                              const dbTable = tablesFromDb.find(
                                (t) => t.tableNo === editTableData!.tableNo,
                              );
                              if (dbTable && dbTable._id) {
                                await Meteor.callAsync(
                                  "tables.clearOrder",
                                  dbTable._id,
                                );
                                // Also remove the order from OrdersCollection so it doesn't display in Kitchen Management
                                if (dbTable.activeOrderID) {
                                  await Meteor.callAsync(
                                    "orders.removeOrder",
                                    dbTable.activeOrderID,
                                  );
                                }
                              }
                            });
                            setConfirmOpen(true);
                            return;
                          }
                          setOccupiedToggle(false);
                          setOccupancyInput("");
                        }
                      }}
                      variant={`${occupiedToggle ? "negative" : "positive"}`}
                      aria-pressed={occupiedToggle}
                      aria-label={occupiedToggle ? "Occupied" : "Vacant"}
                    >
                      {occupiedToggle ? "Occupied" : "Vacant"}
                    </Button>
                  </div>
                </div>

                {/* Add Order to Table */}
                {!editTableData?.activeOrderID && (
                  <div className="mb-3">
                    <hr></hr>
                    <label className="block mt-2 font-semibold">
                      Add Order to Table:
                    </label>
                    <div className="mb-3 flex flex-row items-center justify-between gap-2">
                      <select
                        value={selectedMoveOrderNo ?? ""}
                        onChange={(e) => setSelectedMoveOrderNo(e.target.value)}
                        className="text-lg font-semibold bg-press-up-negative-button text-white border-none outline-none rounded-full px-4 py-2 shadow-md"
                        style={{ minWidth: 160 }}
                      >
                        <option value="" className="bg-white text-gray-700">
                          Select Order
                        </option>
                        {orders
                          .filter(
                            (o) =>
                              !o.paid &&
                              o.orderType === OrderType.DineIn &&
                              o.tableNo === null,
                          )
                          .map((o) => (
                            <option
                              key={o._id}
                              value={o._id}
                              className="bg-white text-gray-700"
                            >
                              Order #{o.orderNo}
                            </option>
                          ))}
                      </select>
                      <Button
                        variant="negative"
                        disabled={!selectedMoveOrderNo}
                        onClick={async () => {
                          // Update the selected order's tableNo
                          await Meteor.callAsync(
                            "orders.updateOrder",
                            selectedMoveOrderNo,
                            { tableNo: editTableData.tableNo },
                          );
                          // Add order to table
                          await Meteor.callAsync(
                            "tables.addOrder",
                            editTableData._id,
                            selectedMoveOrderNo,
                          );
                          // Set table as occupied with at least 1 occupant
                          await Meteor.callAsync(
                            "tables.setOccupied",
                            editTableData._id,
                            true,
                            1,
                          );
                          // Re-render by updating grid from DB
                          const refreshedTables = TablesCollection.find(
                            {},
                            { sort: { tableNo: 1 } },
                          ).fetch();
                          const newGrid = Array(GRID_SIZE).fill(null);
                          refreshedTables.forEach((table, idx) => {
                            if (idx < GRID_SIZE) {
                              newGrid[idx] = table;
                            }
                          });
                          setGrid(newGrid);
                          setModalType(null);
                          markChanged();
                          goToOrder(String(selectedMoveOrderNo));
                        }}
                      >
                        Add Order
                      </Button>
                    </div>
                  </div>
                )}

                {/* Move Order to Table */}
                {editTableData?.activeOrderID && (
                  <div className="mb-3">
                    <hr></hr>
                    <label className="block mt-2 font-semibold">
                      Move Order to Table:
                    </label>
                    <div className="mb-3 flex flex-row items-center justify-between gap-2">
                      <select
                        value={selectedMoveTableNo ?? ""}
                        onChange={(e) => setSelectedMoveTableNo(e.target.value)}
                        className="text-lg font-semibold bg-press-up-negative-button text-white border-none outline-none rounded-full px-4 py-2 shadow-md"
                        style={{ minWidth: 160 }}
                      >
                        <option value="" className="bg-white text-gray-700">
                          Select Table
                        </option>
                        {tablesFromDb
                          .filter(
                            (t) =>
                              !t.isOccupied &&
                              t.tableNo !== editTableData.tableNo,
                          )
                          .map((t) => (
                            <option
                              key={t.tableNo}
                              value={t.tableNo}
                              className="bg-white text-gray-700"
                            >
                              Table {t.tableNo}
                            </option>
                          ))}
                      </select>
                      <Button
                        variant="negative"
                        disabled={!selectedMoveTableNo}
                        onClick={async () => {
                          const newTable = tablesFromDb.find(
                            (t) => t.tableNo === Number(selectedMoveTableNo),
                          );
                          if (!newTable || !editTableData.activeOrderID) return;
                          // Clear old table
                          await Meteor.callAsync(
                            "tables.clearOrder",
                            editTableData._id,
                          );
                          // Set new table
                          await Meteor.callAsync(
                            "tables.addOrder",
                            newTable._id,
                            editTableData.activeOrderID,
                          );
                          await Meteor.callAsync(
                            "tables.setOccupied",
                            newTable._id,
                            true,
                            1,
                          );
                          // Update order's tableNo
                          await Meteor.callAsync(
                            "orders.updateOrder",
                            editTableData.activeOrderID,
                            { tableNo: newTable.tableNo },
                          );
                          // Re-render by updating grid from DB
                          const refreshedTables = TablesCollection.find(
                            {},
                            { sort: { tableNo: 1 } },
                          ).fetch();
                          const newGrid = Array(GRID_SIZE).fill(null);
                          refreshedTables.forEach((table, idx) => {
                            if (idx < GRID_SIZE) {
                              newGrid[idx] = table;
                            }
                          });
                          setGrid(newGrid);
                          setModalType(null);
                        }}
                      >
                        Move
                      </Button>
                    </div>
                  </div>
                )}

                {/* Table Bookings */}
                
                <div className="mb-3">
                  <hr></hr>
                  <label className="block mt-2 font-semibold">Bookings:</label>
                  {editTableData?.bookings && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {editTableData.bookings
                        .sort((a: TableBooking, b: TableBooking) => 
                          new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime()
                        )
                        .filter((booking: TableBooking) => new Date(booking.bookingDate) >= new Date())
                        .map((booking: TableBooking, idx: number) => (
                          <div key={idx} className="bg-gray-50 p-2 rounded-lg text-sm">
                            <div className="font-medium">{booking.customerName}</div>
                            <div className="text-gray-600">
                              {new Date(booking.bookingDate).toLocaleString()} · {booking.partySize} people
                            </div>
                            {booking.notes && (
                              <div className="text-gray-500 italic">{booking.notes}</div>
                            )}
                            <Button
                              variant="positive"
                              onClick={() => {
                                Meteor.call(
                                  "tables.removeBooking",
                                  editTableData._id,
                                  booking.bookingDate,
                                  (err: unknown) => {
                                    if (err) alert(`Failed to remove booking: ${String(err)}`);
                                  }
                                );
                              }}
                            >
                              Cancel Booking
                            </Button>
                          </div>
                        ))}
                    </div>
                    )}
                </div>
                
                <Button
                    variant="negative"
                    onClick={() => {
                      setModalType("addBooking");
                      resetBookingForm();
                    }}
                  >
                    Add Booking
                </Button>

                {/* Bottom row: Cancel & Save */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="negative"
                    onClick={async () => {
                      if (
                        !capacityInput ||
                        isNaN(Number(capacityInput)) ||
                        Number(capacityInput) < 1 ||
                        Number(capacityInput) > 12
                      ) {
                        alert(
                          "Please enter a valid number of seats (between 1 and 12).",
                        );
                        return;
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
                  >
                    Save
                  </Button>
                  <Button
                    variant="positive"
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
                  >
                    Cancel
                  </Button>
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
                  <Button
                    variant="negative"
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
                        // Clear order from kitchen management if table has an active order
                        if (dbTable.activeOrderID) {
                          await Meteor.callAsync(
                            "orders.removeOrder",
                            dbTable.activeOrderID,
                          );
                        }
                        await Meteor.callAsync(
                          "tables.removeTable",
                          dbTable._id,
                        );
                      }
                    }}
                  >
                    Delete
                  </Button>
                  <Button variant="positive" onClick={() => setModalType(null)}>
                    Cancel
                  </Button>
                </div>
              </>
            )}

            {/* Add Booking Modal */}
            {modalType === "addBooking" && editTableData && (
              <>
                <h2 className="text-lg font-semibold mb-4">
                  Add Booking for Table {editTableData.tableNo}
                </h2>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await new Promise((resolve, reject) => {
                      Meteor.call(
                        "tables.addBooking",
                        editTableData._id,
                        {
                          customerName: bookingForm.customerName,
                          customerPhone: bookingForm.customerPhone,
                          partySize: parseInt(bookingForm.partySize),
                          bookingDate: bookingForm.bookingDate,
                          notes: bookingForm.notes || undefined,
                        },
                        (err: unknown) => (err ? reject(err) : resolve(undefined))
                      );
                    });
                    setModalType("editTable");
                    resetBookingForm();
                  } catch (err) {
                    alert(`Failed to add booking: ${String(err)}`);
                  }
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={bookingForm.customerName}
                        onChange={(e) =>
                          setBookingForm((prev) => ({
                            ...prev,
                            customerName: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={bookingForm.customerPhone}
                        onChange={(e) =>
                          setBookingForm((prev) => ({
                            ...prev,
                            customerPhone: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Party Size *
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={editTableData.capacity}
                        value={bookingForm.partySize}
                        onChange={(e) =>
                          setBookingForm((prev) => ({
                            ...prev,
                            partySize: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        min={new Date().toISOString().slice(0, 16)}
                        value={bookingForm.bookingDate}
                        onChange={(e) =>
                          setBookingForm((prev) => ({
                            ...prev,
                            bookingDate: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Notes
                      </label>
                      <textarea
                        value={bookingForm.notes}
                        onChange={(e) =>
                          setBookingForm((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      variant="positive"
                      onClick={() => {
                        setModalType("editTable");
                        resetBookingForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button variant="negative" type="submit">
                      Add Booking
                    </Button>
                  </div>
                </form>
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
                  <Button
                    variant="negative"
                    onClick={() => {
                      saveChanges();
                      setModalType(null);
                    }}
                  >
                    Save & Exit
                  </Button>
                  <Button variant="positive" onClick={discardChanges}>
                    Discard Changes
                  </Button>
                  <Button variant="positive" onClick={() => setModalType(null)}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DndProvider>
  );
};
