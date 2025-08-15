import { Meteor } from "meteor/meteor";
import React, { useEffect, useState } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { TablesCollection } from "/imports/api/tables/TablesCollection";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// -------- Seat positioning helper --------
const getSeatPositions = (seatCount: number): { left: number; top: number }[] => {
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
}

interface TableCardProps {
  table: Table;
  cardColour: string;
  isDragging: boolean;
  dragRef: React.Ref<HTMLDivElement>;
  onEdit: () => void;
}

// -------- TableCard --------
const TableCard = ({ table, cardColour, isDragging, dragRef, onEdit }: TableCardProps) => {
  const seatPositions = getSeatPositions(table?.capacity ?? 0);
  const occupied = typeof table.noOccupants === "number" ? table.noOccupants : 0;
  const capacity = table?.capacity ?? 0;
  let occupiedIndexes: number[] = [];
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
            occupiedIndexes.includes(i) ? "bg-purple-600" : "bg-gray-300"
          }`}
          style={{ left: pos.left, top: pos.top, transform: "translate(-50%, -50%)" }}
        />
      ))}
      <span className="text-lg font-semibold mb-2 z-10">Table {table?.tableNo ?? ""}</span>
      <button
        onClick={onEdit}
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #6f597b",
          color: "#6f597b"
        }}
        className="text-xs px-2 py-1 rounded hover:bg-[#c4b5cf]"
      >
        Edit
      </button>
    </div>
  );
};

export const TablesPage = () => {
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("POS System - Tables");
  }, [setPageTitle]);

  useSubscribe("tables");
  const tablesFromDb = useTracker(() => TablesCollection.find({}, { sort: { tableNo: 1 } }).fetch());

  const [levels, setLevels] = useState<{ name: string; sections: string[] }[]>([
    { name: "Ground Floor", sections: ["Section 1"] }
  ]);
  const [selectedLevel, setSelectedLevel] = useState("Ground Floor");
  const [selectedSection, setSelectedSection] = useState("Section 1");
  const [grids, setGrids] = useState<Record<string, Record<string, (Table | null)[]>>>({});
  const GRID_ROWS = 3;
  const GRID_COLS = 5;
  const GRID_SIZE = GRID_ROWS * GRID_COLS;

  const [editMode, setEditMode] = useState(false);
  const userIsAdmin = Meteor.user()?.username === "admin";
  const [hasChanges, setHasChanges] = useState(false);

  const [modalType, setModalType] = useState<
    null | "addLevel" | "addSection" | "addTable" | "editTable" | "deleteSection" | "deleteLevel" | "exitConfirm"
  >(null);
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null);
  const [editTableData, setEditTableData] = useState<Table | null>(null);
  const [capacityInput, setCapacityInput] = useState("");
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    const newGrids = { ...grids };
    levels.forEach(level => {
      if (!newGrids[level.name]) newGrids[level.name] = {};
      level.sections.forEach(section => {
        if (!newGrids[level.name][section]) {
          newGrids[level.name][section] = Array(GRID_SIZE).fill(null);
        }
      });
    });
    setGrids(newGrids);
  }, [levels]);

  const markChanged = () => setHasChanges(true);

  const moveTable = (fromIdx: number, toIdx: number) => {
    const updated = [...(grids[selectedLevel][selectedSection] ?? [])];
    updated[toIdx] = updated[fromIdx];
    updated[fromIdx] = null;
    setGrids(prev => ({
      ...prev,
      [selectedLevel]: { ...prev[selectedLevel], [selectedSection]: updated }
    }));
    markChanged();
  };

  const getNextTableNumber = () => {
    const allTables = Object.values(grids)
      .flatMap(levelSections => Object.values(levelSections))
      .flat()
      .filter(t => t !== null) as Table[];
    return allTables.length + 1;
  };

  const GridCell = ({ table, cellIndex }: { table: Table | null; cellIndex: number }) => {
    const [{ isOver, canDrop }, drop] = useDrop({
      accept: "TABLE",
      canDrop: () => editMode && grids[selectedLevel][selectedSection][cellIndex] === null,
      drop: (item: { index: number }) => {
        if (!editMode) return;
        moveTable(item.index, cellIndex);
        item.index = cellIndex;
      },
      collect: monitor => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
      })
    });

    const [{ isDragging }, drag] = useDrag({
      type: "TABLE",
      item: { index: cellIndex },
      canDrag: !!table && editMode,
      collect: monitor => ({
        isDragging: monitor.isDragging()
      })
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
            cardColour={table.isOccupied ? "bg-purple-200" : "bg-gray-200"}
            isDragging={isDragging}
            dragRef={drag as unknown as React.Ref<HTMLDivElement>}
            onEdit={() => {
              setEditTableData(table);
              setCapacityInput(table.capacity.toString());
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

  const saveChanges = () => {
    setHasChanges(false);
    setEditMode(false);
  };

  const exitEditMode = () => {
    if (hasChanges) {
      setModalType("exitConfirm");
    } else {
      setEditMode(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      {/* HEADER BUTTONS */}
      {/* ... rest of file will continue with the updated button colours */}
      <div className="p-6 overflow-y-auto w-full" style={{ maxHeight: "calc(100vh - 100px)" }}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <label className="text-sm font-medium">Choose Level</label>
              <select
                value={selectedLevel}
                onChange={e => {
                  if (e.target.value === "__add__") {
                    setNameInput("");
                    setModalType("addLevel");
                  } else {
                    setSelectedLevel(e.target.value);
                    setSelectedSection(
                      levels.find(l => l.name === e.target.value)?.sections[0] ?? ""
                    );
                  }
                }}
                className="border rounded px-2 py-1"
              >
                {levels.map(l => (
                  <option key={l.name} value={l.name}>
                    {l.name}
                  </option>
                ))}
                {editMode && <option value="__add__">+ Add Level</option>}
              </select>
            </div>
            {editMode && (
              <button
                onClick={() => {
                  setNameInput(selectedLevel);
                  setModalType("deleteLevel");
                }}
                style={{ backgroundColor: "#c97f97", color: "#fff" }}
                className="px-3 py-1 rounded hover:brightness-90 h-fit self-end"
              >
                Delete Level
              </button>
            )}
          </div>

          <div className="flex gap-2 items-center">
            {levels.find(l => l.name === selectedLevel)?.sections.map(section => (
              <div key={section} className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedSection(section)}
                  style={
                    selectedSection === section
                      ? { backgroundColor: "#1e032e", color: "#fff" }
                      : { backgroundColor: "#fff", color: "#6f597b", border: "1px solid #6f597b" }
                  }
                  className={`px-4 py-1 rounded-full ${
                    selectedSection !== section ? "hover:bg-[#c4b5cf]" : ""
                  }`}
                >
                  {section}
                </button>
                {editMode && (
                  <button
                    onClick={() => {
                      setNameInput(section);
                      setModalType("deleteSection");
                    }}
                    style={{ color: "#c97f97" }}
                    className="font-bold"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {editMode && (
              <button
                onClick={() => {
                  setNameInput("");
                  setModalType("addSection");
                }}
                style={{ backgroundColor: "#fff", border: "1px solid #6f597b", color: "#6f597b" }}
                className="px-2 py-1 rounded hover:bg-[#c4b5cf]"
              >
                + Section
              </button>
            )}
          </div>

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
                onClick={() => setEditMode(true)}
                style={{ backgroundColor: "#1e032e", color: "#fff" }}
                className="px-4 py-1 rounded hover:bg-[#6f597b]"
              >
                Enter Edit Mode
              </button>
            ))}
        </div>

        <div className="grid grid-cols-5 gap-8 p-4 justify-items-center">
          {grids[selectedLevel]?.[selectedSection]?.map((table, idx) => (
            <GridCell key={idx} table={table} cellIndex={idx} />
          ))}
        </div>
      </div>

      {/* Modals */}
      {modalType && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            {/* Add Level */}
            {modalType === "addLevel" && (
              <>
                <h2 className="text-lg font-semibold mb-4">Add Level</h2>
                <input
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="w-full border rounded px-2 py-1 mb-4"
                  placeholder="Level Name"
                />
                <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    const newLevel = { name: nameInput, sections: ["Section 1"] };
                    setLevels(prev => [...prev, newLevel]);
                    setSelectedLevel(nameInput);
                    setSelectedSection("Section 1");
                    setModalType(null);
                    markChanged();
                  }}
                  style={{ backgroundColor: "#6f597b", color: "#fff" }}
                  className="px-4 py-1 rounded hover:bg-[#c4b5cf] hover:text-[#1e032e]"
                >
                  Add
                </button>
                  <button
                    onClick={() => setModalType(null)}
                    style={{ backgroundColor: "#fff", border: "1px solid #6f597b", color: "#6f597b" }}
                    className="px-4 py-1 rounded hover:bg-[#c4b5cf]"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
            {/* Delete Level */}
            {modalType === "deleteLevel" && (
              <>
                <h2 className="text-lg font-semibold mb-4">Delete Level</h2>
                <p>Are you sure you want to delete level "{nameInput}"?</p>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => {
                      setLevels(prev => prev.filter(l => l.name !== nameInput));
                      setModalType(null);
                      markChanged();
                    }}
                    style={{ backgroundColor: "#c97f97", color: "#fff" }}
                    className="px-4 py-1 rounded hover:brightness-90"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setModalType(null)}
                    style={{ backgroundColor: "#fff", border: "1px solid #6f597b", color: "#6f597b" }}
                    className="px-4 py-1 rounded hover:bg-[#c4b5cf]"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* Add Section */}
            {modalType === "addSection" && (
              <>
                <h2 className="text-lg font-semibold mb-4">Add Section</h2>
                <input
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="w-full border rounded px-2 py-1 mb-4"
                  placeholder="Section Name"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setLevels(prev =>
                        prev.map(l =>
                          l.name === selectedLevel
                            ? { ...l, sections: [...l.sections, nameInput] }
                            : l
                        )
                      );
                      setModalType(null);
                      markChanged();
                    }}
                    style={{ backgroundColor: "#6f597b", color: "#fff" }}
                    className="px-4 py-1 rounded hover:bg-[#c4b5cf] hover:text-[#1e032e]"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setModalType(null)}
                    style={{ backgroundColor: "#fff", border: "1px solid #6f597b", color: "#6f597b" }}
                    className="px-4 py-1 rounded hover:bg-[#c4b5cf]"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* Delete Section */}
            {modalType === "deleteSection" && (
              <>
                <h2 className="text-lg font-semibold mb-4">Delete Section</h2>
                <p>Are you sure you want to delete section "{nameInput}"?</p>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => {
                      setLevels(prev =>
                        prev.map(l =>
                          l.name === selectedLevel
                            ? { ...l, sections: l.sections.filter(s => s !== nameInput) }
                            : l
                        )
                      );
                      setModalType(null);
                      markChanged();
                    }}
                    style={{ backgroundColor: "#c97f97", color: "#fff" }}
                    className="px-4 py-1 rounded hover:brightness-90"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setModalType(null)}
                    style={{ backgroundColor: "#fff", border: "1px solid #6f597b", color: "#6f597b" }}
                    className="px-4 py-1 rounded hover:bg-[#c4b5cf]"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* Add Table */}
            {modalType === "addTable" && (
              <>
                <h2 className="text-lg font-semibold mb-4">Add Table</h2>
                <input
                  type="number"
                  value={capacityInput}
                  onChange={e => setCapacityInput(e.target.value)}
                  className="w-full border rounded px-2 py-1 mb-4"
                  placeholder="Number of seats"
                  min={1}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      const updated = [...grids[selectedLevel][selectedSection]];
                      if (selectedCellIndex !== null)
                        updated[selectedCellIndex] = {
                          tableNo: getNextTableNumber(),
                          capacity: parseInt(capacityInput, 10)
                        };
                      setGrids(prev => ({
                        ...prev,
                        [selectedLevel]: { ...prev[selectedLevel], [selectedSection]: updated }
                      }));
                      setModalType(null);
                      setCapacityInput("");
                      markChanged();
                    }}
                    style={{ backgroundColor: "#6f597b", color: "#fff" }}
                    className="px-4 py-1 rounded hover:bg-[#c4b5cf] hover:text-[#1e032e]"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setModalType(null)}
                    style={{ backgroundColor: "#fff", border: "1px solid #6f597b", color: "#6f597b" }}
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
                  Edit Table {editTableData.tableNo}
                </h2>
                <input
                  type="number"
                  value={capacityInput}
                  onChange={e => setCapacityInput(e.target.value)}
                  className="w-full border rounded px-2 py-1 mb-4"
                  placeholder="Number of seats"
                  min={1}
                />
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      const updated = grids[selectedLevel][selectedSection].map(t =>
                        t?.tableNo === editTableData.tableNo
                          ? { ...t, capacity: parseInt(capacityInput, 10) }
                          : t
                      );
                      setGrids(prev => ({
                        ...prev,
                        [selectedLevel]: { ...prev[selectedLevel], [selectedSection]: updated }
                      }));
                      setModalType(null);
                      setCapacityInput("");
                      markChanged();
                    }}
                    style={{ backgroundColor: "#1e032e", color: "#fff" }}
                    className="px-4 py-1 rounded hover:bg-[#6f597b]"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      const updated = grids[selectedLevel][selectedSection].map(t =>
                        t?.tableNo === editTableData.tableNo ? null : t
                      );
                      setGrids(prev => ({
                        ...prev,
                        [selectedLevel]: { ...prev[selectedLevel], [selectedSection]: updated }
                      }));
                      setModalType(null);
                      markChanged();
                    }}
                    style={{ backgroundColor: "#c97f97", color: "#fff" }}
                    className="px-4 py-1 rounded hover:brightness-90"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setModalType(null)}
                    style={{ backgroundColor: "#fff", border: "1px solid #6f597b", color: "#6f597b" }}
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
                <p>You have unsaved changes. Would you like to save before exiting?</p>
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
                    onClick={() => {
                      setHasChanges(false);
                      setEditMode(false);
                      setModalType(null);
                    }}
                    style={{ backgroundColor: "#c97f97", color: "#fff" }}
                    className="px-4 py-1 rounded hover:brightness-90"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={() => setModalType(null)}
                    style={{ backgroundColor: "#fff", border: "1px solid #6f597b", color: "#6f597b" }}
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
