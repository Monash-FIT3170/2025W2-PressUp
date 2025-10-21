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
  onEditShift?: (shift: Shift) => void;
}

const statusColour = (status: ShiftStatus) => {
  switch (status) {
    case ShiftStatus.SCHEDULED:
      return "bg-blue-100";
    case ShiftStatus.CLOCKED_IN:
      return "bg-green-100";
    case ShiftStatus.CLOCKED_OUT:
      return "bg-red-100";
    default:
      return "bg-gray-300";
  }
};

export const RosterTable = ({
  staff,
  start: providedStart,
  end: providedEnd,
  onEditShift,
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
      <div className="flex shrink-0 sticky top-0 z-10">
        <div className="w-36 bg-press-up-light-purple py-1 px-2 border-y-2 border-press-up-light-purple rounded-l-lg flex items-center justify-center font-bold text-red-900">
          Staff
        </div>
        <div className="flex-1 relative bg-press-up-light-purple border-y-2 border-press-up-light-purple rounded-r-lg">
          {headerDays.map((day, index) => (
            <div
              key={index}
              className="absolute flex items-center py-1 px-1 font-bold text-red-900 text-sm"
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
          <div
            key={staffMember.id}
            className="flex items-center h-16 border-b border-gray-200"
          >
            <div className="w-36 px-4 py-1 font-medium text-red-900 relative flex items-center h-16">
              <span className="truncate">{staffMember.name}</span>
              <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
            </div>

            <div className="flex-1 h-full relative bg-gray-50">
              {headerDays.slice(1).map((marker, index) => (
                <div
                  key={index}
                  className="absolute h-3/4 bg-amber-700/25 w-px bottom-1/8"
                  style={{ left: `${marker.leftPercent}%` }}
                />
              ))}

              {staffMember.positionedShifts.map((shift, shiftIndex) => {
                return (
                  <div
                    key={shiftIndex}
                    className={clsx(
                      "absolute flex flex-col items-center justify-center h-12 top-2 rounded border text-[10px] font-medium overflow-hidden px-1",
                      statusColour(shift.status),
                      onEditShift &&
                        shift.status === ShiftStatus.SCHEDULED &&
                        "cursor-pointer hover:opacity-80 transition-opacity",
                    )}
                    style={{
                      left: `${shift.leftPercent}%`,
                      width: `${Math.max(shift.widthPercent, 0.5)}%`,
                      zIndex: shift.zIndex,
                    }}
                    title={`${shift.status} - ${shift.start.toLocaleString()} to ${shift.end?.toLocaleString() ?? "Ongoing"}${onEditShift && shift.status === ShiftStatus.SCHEDULED ? " (Click to edit)" : ""}`}
                    onClick={() => {
                      if (
                        onEditShift &&
                        shift.status === ShiftStatus.SCHEDULED
                      ) {
                        onEditShift(shift);
                      }
                    }}
                  >
                    {shift.widthPercent > 4 ? (
                      shift.status === ShiftStatus.CLOCKED_IN && !shift.end ? (
                        <span className="whitespace-nowrap overflow-hidden">
                          Active
                        </span>
                      ) : (
                        <>
                          <span className="whitespace-nowrap overflow-hidden">
                            {shift.start.toLocaleTimeString(locale, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="whitespace-nowrap overflow-hidden">
                            {shift.end?.toLocaleTimeString(locale, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </>
                      )
                    ) : null}
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
