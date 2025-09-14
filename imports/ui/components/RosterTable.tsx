import { Meteor } from "meteor/meteor";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import React, { useEffect, useState, useMemo } from "react";
import { Shift, ShiftsCollection } from "/imports/api/shifts/ShiftsCollection";
import { RoleEnum, roleColors } from "/imports/api/accounts/roles";
import { Modal } from "./Modal";

// Helper to get the most recent Monday from a date
function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday as start, Sunday as end
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Helper to format date as 'Apr 29, 2024'
function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Helper to format time as '08:00' or '08:30'
function formatTime(hour: number, minute: number) {
  return (
    hour.toString().padStart(2, "0") + ":" + minute.toString().padStart(2, "0")
  );
}

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface RosterTableProps {
  PublishShiftButton: React.ReactNode;
}

export const RosterTable = ({ PublishShiftButton }: RosterTableProps) => {
  const today = new Date();
  const baseMonday = getMonday(today);

  const shiftsLoading = useSubscribe("shifts.all")();
  const usersLoading = useSubscribe("users.all")();
  const staffShifts = useTracker(() => {
    const staffMap = new Map<
      string,
      { name: string; role: string; shifts: Shift[] }
    >();

    Meteor.users
      .find(
        {},
        {
          fields: {
            "profile.firstName": 1,
            "profile.lastName": 1,
            username: 1,
          },
        },
      )
      .forEach((user) => {
        staffMap.set(user._id, {
          name:
            `${user.profile?.firstName ?? ""} ${user.profile?.lastName ?? ""}`.trim() ||
            user.username ||
            "Unknown",
          role: RoleEnum.CASUAL,
          shifts: [],
        });
      });

    ShiftsCollection.find({}, { sort: { date: 1 } }).forEach((shift) => {
      if (!staffMap.has(shift.user)) {
        staffMap.set(shift.user, { name: "Unknown", role: "", shifts: [] });
      }
      staffMap.get(shift.user)!.shifts.push(shift);
    });

    return Array.from(staffMap.values());
  }, [shiftsLoading, usersLoading]);

  const [allRoles, setAllRoles] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  // Edit modal state for time inputs
  const [editStart, setEditStart] = useState<{
    hour: number;
    minute: number;
  } | null>(null);
  const [editEnd, setEditEnd] = useState<{
    hour: number;
    minute: number;
  } | null>(null);

  // When modal opens, initialize edit state
  useEffect(() => {
    if (selectedShift) {
      setEditStart({ ...selectedShift.start });
      setEditEnd({ ...selectedShift.end });
    }
  }, [selectedShift]);

  useEffect(() => {
    // Use roles defined in roles.ts instead of dynamically generating from data
    const definedRoles = Object.values(RoleEnum);
    setAllRoles(definedRoles);
  }, []);

  useEffect(() => {
    if (allRoles.length > 0 && roleFilter.length === 0) {
      setRoleFilter(allRoles);
    }
  }, [allRoles, roleFilter.length]);

  // Start with the most recent Monday as the base week
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = prev, +1 = next
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Calculate the start and end dates for the current week
  const weekStart = useMemo(() => {
    const start = new Date(baseMonday);
    start.setDate(start.getDate() + weekOffset * 7);
    return start;
  }, [baseMonday, weekOffset]);

  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);
    return end;
  }, [weekStart]);

  // Get the date for each day in the week (Monday-Sunday)
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const filteredShifts = useMemo(() => {
    return staffShifts.filter((s) => roleFilter.includes(s.role));
  }, [staffShifts, roleFilter]);

  const getShiftForStaffAndDay = (
    staff: { shifts: Shift[]; role: string },
    dayIndex: number,
  ) => {
    const cellDate = weekDates[dayIndex];
    return (
      staff.shifts.find(
        (shift) => shift.date.toDateString() == cellDate.toDateString(),
      ) || null
    );
  };

  // Handle role filter change
  const handleRoleChange = (role: string) => {
    setRoleFilter((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  // Get display text for dropdown button
  const getDropdownText = () => {
    if (roleFilter.length === 0) return "All Roles";
    if (roleFilter.length === allRoles.length) return "All Roles";
    if (roleFilter.length === 1) return roleFilter[0];
    return `${roleFilter.length} roles selected`;
  };

  return (
    <div className="overflow-x-auto mt-8">
      <div className="flex items-center mb-4 gap-4">
        <button
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setWeekOffset((w) => w - 1)}
        >
          Previous Week
        </button>
        <span className="font-semibold text-lg">
          {formatDate(weekStart)} - {formatDate(weekEnd)}
        </span>
        <button
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setWeekOffset((w) => w + 1)}
        >
          Next Week
        </button>
        <div className="flex items-center ms-8 relative">
          <img
            src="/filter-icon.svg"
            alt="Filter Icon"
            className="mr-2 w-5 h-5 text-red-900"
          />
          <label htmlFor="role-filter" className="mr-2 font-bold text-red-900">
            Role:
          </label>
          <div className="relative">
            <button
              id="role-filter"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="border border-red-900 rounded-xl px-3 py-1 text-red-900 bg-white min-w-32 text-left flex items-center justify-between"
            >
              <span>{getDropdownText()}</span>
              <span className="ml-2">▼</span>
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-red-900 rounded-xl shadow-lg z-10">
                {allRoles.map((role) => (
                  <label
                    key={role}
                    className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={roleFilter.includes(role)}
                      onChange={() => handleRoleChange(role)}
                      className="mr-2"
                    />
                    {role}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="px-4 ml-auto">{PublishShiftButton}</div>
      </div>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-2 py-1 bg-gray-100 text-left">
              Employee
            </th>
            {daysOfWeek.map((day, i) => (
              <th
                key={day}
                className="border border-gray-300 px-2 py-1 bg-gray-100"
                style={{ minHeight: "60px" }}
              >
                {day}
                <div className="text-xs text-gray-500">
                  {formatDate(weekDates[i])}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredShifts.map((staff) => (
            <tr key={staff.name}>
              <td className="border border-gray-300 px-2 py-1 font-medium text-left">
                {staff.name}
              </td>
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const shift = getShiftForStaffAndDay(staff, dayIndex);
                return (
                  <td
                    key={dayIndex}
                    className="border border-gray-300 p-0 align-top"
                    style={{ minHeight: "60px", position: "relative" }}
                  >
                    {shift ? (
                      <div
                        onClick={() => {
                          setSelectedShift(shift);
                          setIsShiftModalOpen(true);
                        }}
                        style={{
                          backgroundColor: roleColors[staff.role] || "#6b7280",
                          color: "#fff",
                          borderRadius: "0.375rem",
                          padding: "0.25rem 0.5rem",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "2px",
                          width: "100%",
                          height: "100%",
                          minHeight: "60px",
                          cursor: "pointer",
                        }}
                      >
                        <span
                          className="font-mono text-sm text-center"
                          style={{ color: "#fff" }}
                        >
                          {formatTime(shift.start.hour, shift.start.minute)} -{" "}
                          {formatTime(shift.end.hour, shift.end.minute)}
                        </span>
                        <span
                          className="text-xs text-center font-mono"
                          style={{ color: "rgba(255,255,255,0.9)" }}
                        >
                          {staff.role}
                        </span>
                      </div>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Shift Edit/Delete Modal */}
      {isShiftModalOpen && selectedShift && editStart && editEnd && (
        <Modal
          open={isShiftModalOpen}
          onClose={() => setIsShiftModalOpen(false)}
        >
          <div className="p-4">
            {}
            <h2 className="text-lg font-bold mb-4">Edit Shift</h2>

            <div className="mb-4">
              <div>Date: {selectedShift.date.toLocaleDateString()}</div>
              <div className="mb-2">
                <label>
                  Start:{" "}
                  <input
                    type="time"
                    value={`${String(editStart.hour).padStart(2, "0")}:${String(editStart.minute).padStart(2, "0")}`}
                    onChange={(e) => {
                      const [h, m] = e.target.value.split(":").map(Number);
                      setEditStart({ hour: h, minute: m });
                    }}
                  />
                </label>
              </div>
              <div className="mb-2">
                <label>
                  End:{" "}
                  <input
                    type="time"
                    value={`${String(editEnd.hour).padStart(2, "0")}:${String(editEnd.minute).padStart(2, "0")}`}
                    onChange={(e) => {
                      const [h, m] = e.target.value.split(":").map(Number);
                      setEditEnd({ hour: h, minute: m });
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              {}
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => {
                  Meteor.call(
                    "shifts.update",
                    {
                      shiftId: selectedShift._id,
                      start: editStart,
                      end: editEnd,
                    },
                    (err: any) => {
                      if (err) {
                        alert("Failed to update shift: " + err.reason);
                      }
                      setIsShiftModalOpen(false);
                    },
                  );
                }}
              >
                Save
              </button>

              <button
                className="bg-red-600 text-white px-4 py-2 rounded"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this shift?")) {
                    Meteor.call(
                      "shifts.remove",
                      selectedShift._id,
                      (err: any) => {
                        if (err) {
                          alert("Failed to delete shift: " + err.reason);
                        }
                        setIsShiftModalOpen(false);
                      },
                    );
                  }
                }}
              >
                Delete
              </button>

              <button
                className="bg-gray-300 text-black px-4 py-2 rounded"
                onClick={() => setIsShiftModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
