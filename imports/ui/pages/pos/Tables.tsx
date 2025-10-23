import { Meteor } from "meteor/meteor";
import React, { useEffect, useState } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import {
  TablesCollection,
  TableBooking,
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

// Helper function to check if a table has a current booking
const getCurrentBooking = (bookings?: TableBooking[]): TableBooking | null => {
  if (!bookings) return null;

  const now = new Date();

  // Find a booking that's currently active
  const currentBooking = bookings.find((booking) => {
    const bookingTime = new Date(booking.bookingDate);
    const bookingEndTime = new Date(bookingTime.getTime() + booking.duration * 60 * 1000);
    return now >= bookingTime && now <= bookingEndTime;
  });

  return currentBooking || null;
};

// -------- TableCard --------
const TableCard = ({
  table,
  cardColour,
  isDragging,
  dragRef,
  onEdit,
}: TableCardProps) => {
  // State for real-time booking status
  const [activeBooking, setActiveBooking] = useState<TableBooking | null>(getCurrentBooking(table.bookings));
  const [remainingMinutes, setRemainingMinutes] = useState<number>(0);

  // Update remaining time every minute
  useEffect(() => {
    if (!activeBooking) return;

    const updateRemainingTime = () => {
      const now = new Date();
      const bookingTime = new Date(activeBooking.bookingDate);
      const bookingEndTime = new Date(bookingTime.getTime() + activeBooking.duration * 60 * 1000);
      const remainingMs = bookingEndTime.getTime() - now.getTime();
      setRemainingMinutes(Math.max(0, Math.ceil(remainingMs / (1000 * 60))));
    };

    // Initial update
    updateRemainingTime();

    // Set up interval for updates
    const interval = setInterval(updateRemainingTime, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [activeBooking]);

  // Check for booking status changes every 10 seconds
  useEffect(() => {
    const checkBookingStatus = () => {
      // Trigger cleanup first
      Meteor.call("tables.cleanupExpiredBookings", (err: unknown) => {
        if (err) console.error("Failed to cleanup expired bookings:", err);
      });

      const currentBooking = getCurrentBooking(table.bookings);
      const currentActiveBookingId = activeBooking?.bookingDate.getTime() ?? 0;
      const newActiveBookingId = currentBooking?.bookingDate.getTime() ?? 0;

      // Update state and table occupancy if booking status changed
      if (currentActiveBookingId !== newActiveBookingId) {
        setActiveBooking(currentBooking || null);
        
        if (table._id) {
          if (currentBooking) {
            // New booking started - update occupancy
            Meteor.call(
              "tables.setOccupied",
              table._id,
              true,
              currentBooking.partySize,
              (err: unknown) => {
                if (err) console.error("Failed to update table occupancy:", err);
              }
            );
          } else {
            // Booking ended - clear occupancy only if it was set by this booking
            Meteor.call(
              "tables.setOccupied",
              table._id,
              false,
              0,
              (err: unknown) => {
                if (err) console.error("Failed to clear table occupancy:", err);
              }
            );
          }
        }
      }
    };

    // Initial check
    checkBookingStatus();

    // Set up interval for periodic checks
    const interval = setInterval(checkBookingStatus, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [table.bookings, table._id, activeBooking]);

  const seatPositions = getSeatPositions(table?.capacity ?? 0);
  // Use booking party size if there's a current booking
  const occupied = activeBooking
    ? activeBooking.partySize
    : typeof table.noOccupants === "number"
      ? table.noOccupants
      : 0;
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
      } rounded-full ${activeBooking ? "ring-2 ring-yellow-400" : ""}`}
      style={{ width: 140, height: 140 }}
    >
      {activeBooking && (
        <div className="bg-yellow-400 text-black text-xs px-2 py-1 rounded-full flex flex-col items-center">
          <div>Reserved</div>
          <div>{remainingMinutes}m remaining</div>
        </div>
      )}
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
      <Button
        onClick={onEdit}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0)",
          border: "1px solid black",
          color: "black",
        }}
      >
        Edit
      </Button>
    </div>
  );
};

export const TablesPage = () => {
  const navigate = useNavigate();
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("POS System - Tables");
  }, [setPageTitle]);

  // Run cleanup of expired bookings every minute and on component mount
  useEffect(() => {
    // Initial cleanup
    Meteor.call("tables.cleanupExpiredBookings", (err: unknown) => {
      if (err) console.error("Failed to cleanup expired bookings:", err);
    });

    // Set up periodic cleanup
    const cleanupInterval = setInterval(() => {
      Meteor.call("tables.cleanupExpiredBookings", (err: unknown) => {
        if (err) console.error("Failed to cleanup expired bookings:", err);
      });
    }, 60 * 1000); // Run every minute

    // Cleanup interval on component unmount
    return () => clearInterval(cleanupInterval);
  }, []);

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
  // Merge mode state
  const [mergeMode, setMergeMode] = useState(false);
  const [selectedMergeTables, setSelectedMergeTables] = useState<number[]>([]);
  // Split mode state
  const [splitMode, setSplitMode] = useState(false);
  const [selectedSplitTables, setSelectedSplitTables] = useState<number[]>([]);
  const userIsAdmin = Meteor.user()?.username === "admin";
  const [hasChanges, setHasChanges] = useState(false);

  const [modalType, setModalType] = useState<
    | null
    | "addTable"
    | "editTable"
    | "exitConfirm"
    | "deleteTable"
    | "addBooking"
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
  const [addOrderId, setAddOrderId] = useState<string | null>(null);

  // Initial booking form state
  const initialBookingForm = {
    customerName: "",
    customerPhone: "",
    partySize: "",
    bookingDate: "",
    duration: "",
    notes: "",
  };
  const [bookingForm, setBookingForm] = useState(initialBookingForm);
  const resetBookingForm = () => setBookingForm(initialBookingForm);

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

  // Merge tables logic
  const toggleMergeTable = (tableNo: number) => {
    setSelectedMergeTables((prev) =>
      prev.includes(tableNo)
        ? prev.filter((n) => n !== tableNo)
        : [...prev, tableNo],
    );
  };

  const toggleSplitTable = (tableNo: number) => {
    setSelectedSplitTables((prev) =>
      prev.includes(tableNo)
        ? prev.filter((n) => n !== tableNo)
        : [...prev, tableNo],
    );
  };

  const resetMergeMode = () => {
    setMergeMode(false);
    setSelectedMergeTables([]);
  };

  const resetSplitMode = () => {
    setSplitMode(false);
    setSelectedSplitTables([]);
  };

  // Merge tables and orders
  const handleMergeTables = async () => {
    if (selectedMergeTables.length < 2) return;
    // Find all selected tables
    const tablesToMerge = tablesFromDb.filter((t) =>
      selectedMergeTables.includes(t.tableNo),
    );
    // Find all active orders for these tables
    const activeOrders = orders.filter((o) =>
      tablesToMerge.some((t) => t.activeOrderID && t.activeOrderID === o._id),
    );
    if (activeOrders.length === 0) return;
    // Pick the earliest order as the merged order
    const mergedOrder = activeOrders.reduce((earliest, curr) =>
      curr.createdAt < earliest.createdAt ? curr : earliest,
    );
    // Merge menu items from all orders
    const mergedMenuItems = activeOrders.flatMap((o) => o.menuItems);
    // Calculate new total price
    const mergedTotal = mergedMenuItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    // Call server method to update orders and tables
    Meteor.call(
      "tables.mergeTablesAndOrders",
      {
        tableNos: selectedMergeTables,
        mergedOrderId: mergedOrder._id,
        mergedMenuItems,
        mergedTotal,
      },
      (err: any) => {
        if (err) {
          alert("Failed to merge tables: " + err.reason);
        } else {
          resetMergeMode();
        }
      },
    );
  };

  const handleSplitTables = async () => {
    if (selectedSplitTables.length === 0) return;
    // determine merged order id (use first selected table's activeOrderID)
    const table = tablesFromDb.find(
      (t) => t.tableNo === selectedSplitTables[0],
    );
    const mergedOrderId = table?.activeOrderID;
    if (!mergedOrderId)
      return alert("Selected table has no active merged order");

    Meteor.call(
      "tables.splitTablesFromOrder",
      { orderId: mergedOrderId, tableNos: selectedSplitTables },
      (err: any) => {
        if (err) {
          alert("Failed to split tables: " + err.reason);
        } else {
          setSplitMode(false);
          setSelectedSplitTables([]);
        }
      },
    );
  };

  // splitAvailable: whether any table references an order that is merged (has multiple tableNos)
  const splitAvailable = tablesFromDb.some((t) => {
    if (!t.activeOrderID) return false;
    const o = orders.find((x) => x._id === t.activeOrderID);
    return !!(o && o.tableNo && o.tableNo.length > 1);
  });

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

    // Merge/Split mode: allow selection
    const isSelectedForMerge =
      table && mergeMode && selectedMergeTables.includes(table.tableNo);
    const isSelectedForSplit =
      table && splitMode && selectedSplitTables.includes(table.tableNo);

    // Determine whether this table is eligible for splitting.
    // A table is eligible for split when it has an activeOrderID and that
    // order has multiple table numbers (i.e. a merged order).
    const orderForTable = table?.activeOrderID
      ? orders.find((o) => o._id === table.activeOrderID)
      : null;
    const isSplitEligible = !!(
      table &&
      splitMode &&
      orderForTable &&
      orderForTable.tableNo &&
      orderForTable.tableNo.length > 1
    );
    return (
      <div
        ref={drop as unknown as React.Ref<HTMLDivElement>}
        className={`relative flex items-center justify-center border border-gray-300 bg-white rounded-full min-h-[150px] min-w-[150px] ${
          isOver && canDrop ? "bg-purple-100" : ""
        } ${isSelectedForMerge || isSelectedForSplit ? "ring-4 ring-press-up-purple" : ""} ${
          // dim non-eligible tables when in split mode
          splitMode && table && !isSplitEligible ? "opacity-40" : ""
        }`}
        style={{
          height: 150,
          width: 150,
          cursor:
            splitMode && table && !isSplitEligible
              ? "not-allowed"
              : (mergeMode || splitMode) && table
                ? "pointer"
                : undefined,
        }}
        onClick={() => {
          if (mergeMode && table) toggleMergeTable(table.tableNo);
          else if (splitMode && table) {
            // prevent selecting non-eligible tables in split mode
            if (!isSplitEligible) return;
            toggleSplitTable(table.tableNo);
          }
        }}
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
              // Do not allow editing while in merge mode. During split mode, only
              // allow edit if the table is eligible for splitting (so we don't
              // open edit UI for greyed-out tables).
              if (mergeMode) return;
              if (splitMode && !isSplitEligible) return;
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
        {mergeMode && table && (
          <div
            className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              isSelectedForMerge
                ? "bg-press-up-purple border-press-up-purple text-white"
                : "bg-white border-gray-400"
            }`}
          >
            {isSelectedForMerge ? "✓" : ""}
          </div>
        )}
        {splitMode && table && (
          <div
            className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              isSelectedForSplit
                ? "bg-yellow-400 border-yellow-400 text-white"
                : "bg-white border-gray-400"
            }`}
          >
            {isSelectedForSplit ? "✓" : ""}
          </div>
        )}
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
    // Clear any merge/split state when entering edit mode
    resetMergeMode();
    resetSplitMode();
    setOriginalGrid(JSON.parse(JSON.stringify(grid)));
    setEditMode(true);
    setHasChanges(false);
  };

  const saveChanges = () => {
    setHasChanges(false);
    setEditMode(false);
    setOriginalGrid(null);
    // clear merge/split state on save
    resetMergeMode();
    resetSplitMode();
  };

  const discardChanges = () => {
    if (originalGrid) {
      setGrid(originalGrid);
    }
    setHasChanges(false);
    setEditMode(false);
    // clear merge/split state on discard
    resetMergeMode();
    resetSplitMode();
    setModalType(null);
  };

  const exitEditMode = () => {
    if (hasChanges) {
      setModalType("exitConfirm");
    } else {
      setEditMode(false);
      // clear any merge/split selection visuals when leaving edit mode
      resetMergeMode();
      resetSplitMode();
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
            {userIsAdmin && (
              <>
                {/* Merge/Split entry buttons */}

                {!mergeMode && !splitMode && (
                  <Button
                    variant="positive"
                    onClick={() => {
                      // entering merge mode; clear split selections
                      resetSplitMode();
                      setMergeMode(true);
                    }}
                  >
                    Merge Tables
                  </Button>
                )}
                {!splitMode && !mergeMode && splitAvailable && (
                  <Button
                    variant="positive"
                    onClick={() => {
                      // entering split mode; clear merge selections
                      resetMergeMode();
                      setSplitMode(true);
                    }}
                  >
                    Split Tables
                  </Button>
                )}
                {/* Merge/Split selected buttons */}
                {/* Merge Tables Button */}
                {mergeMode && (
                  <div className="flex gap-2 items-center">
                    <Button
                      variant="positive"
                      onClick={handleMergeTables}
                      disabled={selectedMergeTables.length < 2}
                    >
                      Merge Selected ({selectedMergeTables.length})
                    </Button>
                    <Button variant="negative" onClick={resetMergeMode}>
                      Cancel Merge
                    </Button>
                  </div>
                )}
                {/* Split Tables Button */}
                {splitMode && (
                  <div className="flex gap-2 items-center">
                    <Button
                      variant="positive"
                      onClick={handleSplitTables}
                      disabled={selectedSplitTables.length < 1}
                    >
                      Split Selected ({selectedSplitTables.length})
                    </Button>
                    <Button
                      variant="negative"
                      onClick={() => {
                        setSplitMode(false);
                        setSelectedSplitTables([]);
                      }}
                    >
                      Cancel Split
                    </Button>
                  </div>
                )}
              </>
            )}
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
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm pt-20">
          <div className="bg-white rounded-lg p-6 shadow-lg max-h-[calc(100vh-120px)] overflow-y-auto" 
               style={{ width: modalType === "addBooking" ? "min(450px, 90vw)" : "320px" }}>
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
                    // prefer the live table record's activeOrderID (in case it changed via merge)
                    const liveTable = tablesFromDb.find(
                      (t) => t.tableNo === editTableData!.tableNo,
                    );
                    const activeOrderId =
                      liveTable?.activeOrderID ?? editTableData?.activeOrderID;
                    const order = activeOrderId
                      ? orders.find((o) => o._id === activeOrderId)
                      : null;
                    if (!order) return null;
                    return (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => {
                            goToOrder(String(activeOrderId));
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
                        value={addOrderId ?? ""}
                        onChange={(e) => setAddOrderId(e.target.value)}
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
                          // Update order's tableNo (store as array)
                          await Meteor.callAsync(
                            "orders.updateOrder",
                            editTableData.activeOrderID,
                            { tableNo: [newTable.tableNo] },
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
                  <hr />
                  <label className="block mt-2 font-semibold">Bookings:</label>
                  {editTableData?.bookings && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {editTableData.bookings
                        .sort(
                          (a: TableBooking, b: TableBooking) =>
                            a.bookingDate.getTime() - b.bookingDate.getTime(),
                        )
                        .map((booking: TableBooking) => (
                          <div
                            key={booking.bookingDate.getTime()}
                            className="bg-gray-50 p-2 rounded-lg text-sm"
                          >
                            <div className="font-medium">
                              {booking.customerName}
                            </div>
                            <div className="text-gray-600">
                              {booking.bookingDate.toLocaleString()} {" - "}
                              {new Date(booking.bookingDate.getTime() + booking.duration * 60 * 1000).toLocaleTimeString()} <br/>
                              {booking.partySize} {(booking.partySize == 1) ? "person" : "people"}
                            </div>
                            {booking.notes && (
                              <div className="text-gray-500 italic">
                                {booking.notes}
                              </div>
                            )}
                            <Button
                              variant="positive"
                              onClick={async () => {
                                try {
                                  await new Promise<void>((resolve, reject) => {
                                    Meteor.call(
                                      "tables.removeBooking",
                                      editTableData._id,
                                      booking.bookingDate.toISOString(),
                                      (err: unknown) =>
                                        err ? reject(err) : resolve(),
                                    );
                                  });

                                  // Update both states in one operation
                                  setGrid((prevGrid) => {
                                    const updatedGrid = prevGrid.map(
                                      (table) => {
                                        if (
                                          !table ||
                                          table._id !== editTableData._id
                                        )
                                          return table;
                                        return {
                                          ...table,
                                          bookings: table.bookings?.filter(
                                            (b) =>
                                              b.bookingDate.getTime() !==
                                              booking.bookingDate.getTime(),
                                          ),
                                        };
                                      },
                                    );

                                    // Update the edit modal data
                                    const updatedTable = updatedGrid.find(
                                      (t) => t?._id === editTableData._id,
                                    );
                                    if (updatedTable) {
                                      setEditTableData(updatedTable);
                                      setModalOriginalTable(updatedTable);
                                    }

                                    return updatedGrid;
                                  });
                                } catch (err) {
                                  alert(
                                    `Failed to remove booking: ${String(err)}`,
                                  );
                                }
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
                      setAddOrderId(null);
                    }}
                  >
                    Cancel
                  </Button>
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
                          // If an order is selected, add it now
                          if (addOrderId) {
                            // Update the selected order's tableNo (store as array)
                            await Meteor.callAsync(
                              "orders.updateOrder",
                              addOrderId,
                              { tableNo: [editTableData.tableNo] },
                            );
                            // Add order to table
                            await Meteor.callAsync(
                              "tables.addOrder",
                              dbTable._id,
                              addOrderId,
                            );
                            // Set table as occupied with at least 1 occupant
                            await Meteor.callAsync(
                              "tables.setOccupied",
                              dbTable._id,
                              true,
                              1,
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
                      // Clear order after save
                      setAddOrderId(null);
                    }}
                  >
                    Save
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
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();

                    const newBooking: TableBooking = {
                      customerName: bookingForm.customerName,
                      customerPhone: bookingForm.customerPhone,
                      partySize: parseInt(bookingForm.partySize),
                      bookingDate: new Date(bookingForm.bookingDate),
                      duration: parseInt(bookingForm.duration),
                      notes: bookingForm.notes || undefined,
                    };

                    try {
                      await new Promise<void>((resolve, reject) => {
                        Meteor.call(
                          "tables.addBooking",
                          editTableData._id,
                          {
                            ...newBooking,
                            bookingDate: bookingForm.bookingDate, // Send string date to server
                          },
                          (err: unknown) => (err ? reject(err) : resolve()),
                        );
                      });

                      // Update grid and table data in one operation
                      setGrid((prevGrid) => {
                        const updatedGrid = prevGrid.map(
                          (table: Table | null) => {
                            if (!table || table._id !== editTableData._id)
                              return table;
                            return {
                              ...table,
                              bookings: [
                                ...(table.bookings || []),
                                newBooking,
                              ].sort(
                                (a, b) =>
                                  a.bookingDate.getTime() -
                                  b.bookingDate.getTime(),
                              ),
                            };
                          },
                        );

                        // Update the edit modal data with the updated table
                        const updatedTable = updatedGrid.find(
                          (t) => t?._id === editTableData._id,
                        );
                        if (updatedTable) {
                          setEditTableData(updatedTable);
                          setModalOriginalTable(updatedTable);
                        }

                        return updatedGrid;
                      });

                      setModalType("editTable");
                      resetBookingForm();
                    } catch (err) {
                      alert(`Failed to add booking: ${String(err)}`);
                    }
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-red-900 dark:text-black">
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
                        className="w-full border rounded px-2 py-1 mb-4"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-red-900 dark:text-black">
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
                        className="w-full border rounded px-2 py-1 mb-4"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-red-900 dark:text-black">
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
                        className="w-full border rounded px-2 py-1 mb-4"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-red-900 dark:text-black">
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
                        className="w-full border rounded px-2 py-1 mb-4"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-red-900 dark:text-black">
                        Duration *
                      </label>
                      <select 
                        value={bookingForm.duration}
                        required
                        onChange={(e) =>
                          setBookingForm((prev) => ({
                            ...prev,
                            duration: e.target.value,
                          }))
                        }
                        className="w-full border rounded px-2 py-1 mb-4">
                        <option value="" className="w-full border rounded px-2 py-1 mb-4">
                          Select Booking Duration
                        </option>
                        <option value="30" className="w-full border rounded px-2 py-1 mb-4">
                          30 minutes
                        </option>
                        <option value="45" className="w-full border rounded px-2 py-1 mb-4">
                          45 minutes
                        </option>
                        <option value="60" className="w-full border rounded px-2 py-1 mb-4">
                          60 minutes
                        </option>
                        <option value="90" className="w-full border rounded px-2 py-1 mb-4">
                          90 minutes
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-red-900 dark:text-black">
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
                        className="w-full border rounded px-2 py-1 mb-4"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      variant="positive"
                      onClick={() => {
                        // When returning to edit table, get fresh data from grid
                        const currentTable = grid.find(
                          (t) => t?._id === editTableData._id,
                        );
                        if (currentTable) {
                          setEditTableData(currentTable);
                          setModalOriginalTable(currentTable);
                        }
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
