import React from "react";
import { Button } from "./interaction/Button";
import { getDayOfWeek, DayOfWeek } from "/imports/helpers/date";

interface WeekNavigationProps {
  selectedWeek: Date;
  onWeekChange: (week: Date) => void;
}

export const WeekNavigation = ({
  selectedWeek,
  onWeekChange,
}: WeekNavigationProps) => {
  const weekEnd = (() => {
    const sunday = new Date(selectedWeek);
    sunday.setDate(selectedWeek.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return sunday;
  })();

  const previousWeek = () => {
    const newWeek = new Date(selectedWeek);
    newWeek.setDate(selectedWeek.getDate() - 7);
    onWeekChange(getDayOfWeek(newWeek, DayOfWeek.MONDAY));
  };

  const nextWeek = () => {
    const newWeek = new Date(selectedWeek);
    newWeek.setDate(selectedWeek.getDate() + 7);
    onWeekChange(getDayOfWeek(newWeek, DayOfWeek.MONDAY));
  };

  const todayWeek = () => {
    onWeekChange(getDayOfWeek(new Date(), DayOfWeek.MONDAY));
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={previousWeek}>← Previous Week</Button>
      <div className="px-4 py-2 font-bold min-w-32 text-center">
        {selectedWeek.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year:
            selectedWeek.getFullYear() !== new Date().getFullYear()
              ? "numeric"
              : undefined,
        })}{" "}
        -{" "}
        {weekEnd.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year:
            weekEnd.getFullYear() !== new Date().getFullYear()
              ? "numeric"
              : undefined,
        })}
      </div>
      <Button onClick={nextWeek}>Next Week →</Button>
      <Button onClick={todayWeek}>Today</Button>
    </div>
  );
};
