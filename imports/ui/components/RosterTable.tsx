import { Meteor } from "meteor/meteor";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import React, { useEffect, useState, useMemo } from "react";
import {
  Shift,
  ShiftsCollection,
  ShiftStatus,
  ShiftTime,
} from "/imports/api/shifts/ShiftsCollection";
import { RoleEnum, roleColors } from "/imports/api/accounts/roles";

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(shiftTime: ShiftTime): string {
  return `${shiftTime.hour.toString().padStart(2, "0")}:${shiftTime.minute.toString().padStart(2, "0")}`;
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
  controls: React.ReactNode;
}

export const RosterTable = ({ controls }: RosterTableProps) => {
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

  useEffect(() => {
    const definedRoles = Object.values(RoleEnum);
    setAllRoles(definedRoles);
  }, []);

  useEffect(() => {
    if (allRoles.length > 0 && roleFilter.length === 0) {
      setRoleFilter(allRoles);
    }
  }, [allRoles, roleFilter.length]);

  const [weekOffset, setWeekOffset] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
      staff.shifts.find((shift) => {
        const shiftDate = new Date(shift.date);
        shiftDate.setHours(0, 0, 0, 0);
        const compareDate = new Date(cellDate);
        compareDate.setHours(0, 0, 0, 0);
        return shiftDate.getTime() === compareDate.getTime();
      }) || null
    );
  };

  const handleRoleChange = (role: string) => {
    setRoleFilter((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const getDropdownText = () => {
    if (roleFilter.length === 0) return "All Roles";
    if (roleFilter.length === allRoles.length) return "All Roles";
    if (roleFilter.length === 1) return roleFilter[0];
    return `${roleFilter.length} roles selected`;
  };

  const renderShiftCell = (shift: Shift, staffRole: string) => {
    const getShiftColor = () => {
      switch (shift.status) {
        case ShiftStatus.SCHEDULED:
          return "#f3f4f6";
        case ShiftStatus.CLOCKED_IN:
          return "#10b981";
        case ShiftStatus.CLOCKED_OUT:
          return roleColors[staffRole] || "#6b7280";
        default:
          return "#6b7280";
      }
    };

    const getTextColor = () => {
      return shift.status === ShiftStatus.SCHEDULED ? "#374151" : "#fff";
    };

    const getStatusText = () => {
      switch (shift.status) {
        case ShiftStatus.SCHEDULED:
          return "Scheduled";
        case ShiftStatus.CLOCKED_IN:
          return "Active";
        case ShiftStatus.CLOCKED_OUT:
          return staffRole;
        default:
          return "";
      }
    };

    const formatTimeRange = () => {
      const startTime = formatTime(shift.start);
      const endTime = shift.end ? formatTime(shift.end) : "Open";
      return endTime ? `${startTime} - ${endTime}` : startTime;
    };

    return (
      <div
        style={{
          backgroundColor: getShiftColor(),
          color: getTextColor(),
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
          border:
            shift.status === ShiftStatus.SCHEDULED
              ? "2px dashed #9ca3af"
              : "none",
        }}
      >
        <span
          className="font-mono text-sm text-center"
          style={{ color: getTextColor() }}
        >
          {formatTimeRange()}
        </span>
        <span
          className="text-xs text-center font-mono"
          style={{
            color:
              shift.status === ShiftStatus.SCHEDULED
                ? "#6b7280"
                : "rgba(255,255,255,0.9)",
          }}
        >
          {getStatusText()}
        </span>
      </div>
    );
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
        <div className="px-4 ml-auto flex flex-row gap-2">{controls}</div>
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
                    {shift ? renderShiftCell(shift, staff.role) : null}
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
