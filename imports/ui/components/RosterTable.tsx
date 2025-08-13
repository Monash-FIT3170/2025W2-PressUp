import React, { useState } from "react";

// Assign a color to each staff member for color coding
const staffColors: Record<string, string> = {
  Alice: "#f87171",   // Red
  Bob: "#60a5fa",     // Blue
  Charlie: "#34d399", // Green
  Dana: "#fbbf24",    // Yellow
};

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
  return hour.toString().padStart(2, "0") + ":" + minute.toString().padStart(2, "0");
}

// Dynamically generate mock staff data for the current and next week, with some 30-min start/end times and roles
const today = new Date();
const baseMonday = getMonday(today);
const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};
const toISO = (date: Date) => date.toISOString().slice(0, 10);

const staffShifts = [
  {
    name: "Alice",
    role: "Wait Staff",
    shifts: [
      { date: toISO(baseMonday), startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 }, // This Monday
      { date: toISO(addDays(baseMonday, 2)), startHour: 12, startMinute: 30, endHour: 20, endMinute: 0 }, // This Wednesday 12:30-20:00
      { date: toISO(addDays(baseMonday, 1)), startHour: 8, startMinute: 0, endHour: 12, endMinute: 30 }, // This Tuesday 08:00-12:30 (overlap with Bob)
      { date: toISO(addDays(baseMonday, 7)), startHour: 10, startMinute: 0, endHour: 18, endMinute: 0 }, // Next Monday
    ],
  },
  {
    name: "Bob",
    role: "Chef",
    shifts: [
      { date: toISO(addDays(baseMonday, 1)), startHour: 8, startMinute: 30, endHour: 16, endMinute: 0 }, // This Tuesday 08:30-16:00 (overlap with Alice 08:30-12:30)
      { date: toISO(addDays(baseMonday, 4)), startHour: 14, startMinute: 0, endHour: 22, endMinute: 30 }, // This Friday 14:00-22:30
      { date: toISO(addDays(baseMonday, 8)), startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 }, // Next Tuesday
    ],
  },
  {
    name: "Charlie",
    role: "Supervisor",
    shifts: [
      { date: toISO(addDays(baseMonday, 5)), startHour: 10, startMinute: 0, endHour: 18, endMinute: 0 }, // This Saturday
      { date: toISO(addDays(baseMonday, 6)), startHour: 7, startMinute: 30, endHour: 15, endMinute: 0 }, // This Sunday 07:30-15:00
      { date: toISO(addDays(baseMonday, 12)), startHour: 12, startMinute: 0, endHour: 20, endMinute: 0 }, // Next Saturday
    ],
  },
  {
    name: "Dana",
    role: "Wait Staff",
    shifts: [
      { date: toISO(baseMonday), startHour: 13, startMinute: 0, endHour: 17, endMinute: 30 }, // This Monday 13:00-17:30 (overlap with Alice)
      { date: toISO(addDays(baseMonday, 2)), startHour: 12, startMinute: 0, endHour: 16, endMinute: 30 }, // This Wednesday 12:00-16:30 (overlap with Alice)
      { date: toISO(addDays(baseMonday, 9)), startHour: 8, startMinute: 0, endHour: 16, endMinute: 0 }, // Next Wednesday
    ],
  },
];

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const allRoles = Array.from(new Set(staffShifts.map((s) => s.role)));

// Tooltip component
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [visible, setVisible] = useState(false);
  return (
    <span
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          style={{
            position: "absolute",
            zIndex: 10,
            left: "50%",
            top: "-2.2em",
            transform: "translateX(-50%)",
            background: "#222",
            color: "#fff",
            padding: "0.25em 0.7em",
            borderRadius: "0.3em",
            fontSize: "0.85em",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
};

export const RosterTable: React.FC = () => {
  // Start with the most recent Monday as the base week
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = prev, +1 = next
  const [roleFilter, setRoleFilter] = useState<string[]>(allRoles);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Calculate the start and end dates for the current week
  const weekStart = new Date(baseMonday);
  weekStart.setDate(weekStart.getDate() + weekOffset * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  // Get the date for each day in the week (Monday-Sunday)
  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  // Helper to get staff working at a given day/time slot (30-min increments)
  const getStaffForCell = (day: number, hour: number, minute: number) => {
    const cellDateStr = weekDates[day].toISOString().slice(0, 10); // 'YYYY-MM-DD'
    return staffShifts
      .filter((staff) => roleFilter.includes(staff.role))
      .map((staff) => {
        const shift = staff.shifts.find((shift) => {
          if (shift.date !== cellDateStr) return false;
          const shiftStart = shift.startHour * 60 + shift.startMinute;
          const shiftEnd = shift.endHour * 60 + shift.endMinute;
          const cellTime = hour * 60 + minute;
          return cellTime >= shiftStart && cellTime < shiftEnd;
        });
        if (shift) {
          return {
            name: staff.name,
            role: staff.role,
            shift,
          };
        }
        return null;
      })
      .filter(Boolean) as { name: string; role: string; shift: { date: string; startHour: number; startMinute: number; endHour: number; endMinute: number } }[];
  };

  // Render table rows for each 30-min increment
  const timeSlots = Array.from({ length: 24 * 2 }).map((_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? 0 : 30;
    return { hour, minute };
  });

  // Handle role filter change
  const handleRoleChange = (role: string) => {
    setRoleFilter((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
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
      </div>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-2 py-1 bg-gray-100">Time</th>
            {daysOfWeek.map((day, i) => (
              <th key={day} className="border border-gray-300 px-2 py-1 bg-gray-100">
                {day}
                <div className="text-xs text-gray-500">
                  {formatDate(weekDates[i])}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(({ hour, minute }, idx) => (
            <tr
              key={idx}
              style={{
                borderTop:
                  minute === 0
                    ? "2px solid #d1d5db" // bold for hour
                    : "1px dashed #e5e7eb", // faint for 30-min
              }}
            >
              <td
                className={
                  minute === 0
                    ? "border border-gray-300 px-2 py-1 font-mono bg-gray-50"
                    : "border border-gray-200 px-2 py-1 font-mono bg-gray-50 text-gray-400"
                }
              >
                {formatTime(hour, minute)}
              </td>
              {Array.from({ length: 7 }).map((_, day) => {
                const staffInCell = getStaffForCell(day, hour, minute);
                return (
                  <td
                    key={day}
                    className={
                      minute === 0
                        ? "border border-gray-300 px-2 py-1"
                        : "border border-gray-200 px-2 py-1 text-gray-400"
                    }
                  >
                    {staffInCell.length > 0 && (
                      <div className="flex flex-col gap-1">
                        {staffInCell.map(({ name, role, shift }) => (
                          <Tooltip
                            key={name}
                            text={`${role} | ${formatTime(shift.startHour, shift.startMinute)} - ${formatTime(shift.endHour, shift.endMinute)}`}
                          >
                            <span
                              style={{
                                backgroundColor: staffColors[name] || "#e5e7eb", // fallback gray
                                color: "#fff",
                                borderRadius: "0.25rem",
                                padding: "0.1rem 0.4rem",
                                fontWeight: 500,
                                fontSize: "0.95em",
                                display: "inline-block",
                                cursor: "pointer",
                              }}
                            >
                              {name}
                            </span>
                          </Tooltip>
                        ))}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
