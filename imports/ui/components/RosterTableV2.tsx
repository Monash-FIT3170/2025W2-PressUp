import React, { useMemo } from "react";
import { Shift, ShiftStatus } from "/imports/api/shifts/ShiftsCollection";
import { getDayOfWeek, DayOfWeek } from "/imports/helpers/date";
import { clsx } from "clsx";

export interface RosterStaff {
  id: string;
  name: string;
  role: string | null;
  shifts: Shift[];
}

interface RosterTableProps {
  staff: RosterStaff[];
  start?: Date;
  end?: Date;
}

const statusColour = (status: ShiftStatus) => {
  switch (status) {
    case ShiftStatus.CLOCKED_IN:
      return "bg-blue-100";
    case ShiftStatus.CLOCKED_IN:
      return "bg-red-100";
    case ShiftStatus.CLOCKED_OUT:
      return "bg-green-100";
    default:
      return "bg-gray-300";
  }
};

export const RosterTableV2 = ({
  staff,
  start: providedStart,
  end: providedEnd,
}: RosterTableProps) => {
  const locale = navigator.language ?? "en-AU";
  const today = new Date();
  const start = providedStart || getDayOfWeek(today, DayOfWeek.MONDAY);
  const end =
    providedEnd ||
    (() => {
      const monday = getDayOfWeek(today, DayOfWeek.MONDAY);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      return sunday;
    })();

  // Timeline sizing
  const timelineData = useMemo(() => {
    const totalMs = end.getTime() - start.getTime();
    const now = new Date();

    return staff.map((staffMember) => {
      const positionedShifts = staffMember.shifts
        .filter((shift) => (shift.end ?? now) >= start && shift.start <= end)
        .map((shift) => {
          const shiftStart = new Date(
            Math.max(shift.start.getTime(), start.getTime()),
          );
          const shiftEnd = new Date(
            Math.min((shift.end ?? now).getTime(), end.getTime()),
          );

          // Start position and length of shift in timeline
          const leftPercent =
            ((shiftStart.getTime() - start.getTime()) / totalMs) * 100;
          const widthPercent =
            ((shiftEnd.getTime() - shiftStart.getTime()) / totalMs) * 100;

          let zIndex;
          switch (shift.status) {
            case ShiftStatus.CLOCKED_IN:
              zIndex = 3;
              break;
            case ShiftStatus.CLOCKED_OUT:
              zIndex = 2;
              break;
            default:
              zIndex = 1;
              break;
          }

          return {
            ...shift,
            leftPercent,
            widthPercent,
            zIndex,
          };
        });

      return {
        ...staffMember,
        positionedShifts,
      };
    });
  }, [staff, start, end]);

  const headerDays = useMemo(() => {
    const days = [];
    const totalWeekMs = end.getTime() - start.getTime();

    const totalDays = Math.ceil(totalWeekMs / (1000 * 60 * 60 * 24));
    for (let i = 0; i < totalDays; i++) {
      const dayStart = new Date(start);
      dayStart.setDate(start.getDate() + i);
      const leftPercent =
        ((dayStart.getTime() - start.getTime()) / totalWeekMs) * 100;

      days.push({
        leftPercent,
        label: dayStart.toLocaleDateString(locale, {
          weekday: "short",
          day: "numeric",
        }),
      });
    }

    return days;
  }, [start, end]);

  return (
    <div className="h-full flex flex-col">
      {/* Sticky header with day indicators */}
      <div className="flex items-center shrink-0">
        <div className="flex items-center justify-center">Staff</div>
        <div className="flex-1 h-full relative">
          {headerDays.map((day, index) => (
            <div
              key={index}
              className="absolute flex items-center"
              style={{ left: `${day.leftPercent}%` }}
            >
              {day.label}
            </div>
          ))}
        </div>
      </div>

      {/* Staff rows */}
      <div className="flex-1 overflow-y-auto">
        {timelineData.map((staffMember) => (
          <div key={staffMember.id} className="flex items-center shrink-0 h-16">
            <div className="">{staffMember.name}</div>

            <div className="flex-1 h-full relative">
              {headerDays.slice(1).map((marker, index) => (
                <div
                  key={index}
                  className="absolute h-full"
                  style={{ left: `${marker.leftPercent}%` }}
                />
              ))}

              {staffMember.positionedShifts.map((shift, shiftIndex) => {
                return (
                  <div
                    key={shiftIndex}
                    className={clsx(
                      "absolute flex h-12 top-2",
                      statusColour(shift.status),
                    )}
                    style={{
                      left: `${shift.leftPercent}%`,
                      width: `${Math.max(shift.widthPercent, 0.5)}%`,
                      zIndex: shift.zIndex,
                    }}
                    title={`${shift.status} - ${shift.start.toLocaleString()} to ${shift.end?.toLocaleString() ?? "Ongoing"}`}
                  >
                    {shift.status === ShiftStatus.CLOCKED_IN && !shift.end
                      ? "Active"
                      : `${shift.start.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })} - ${shift.end?.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}`}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
