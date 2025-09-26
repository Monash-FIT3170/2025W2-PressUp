export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export function getDayOfWeek(
  date: Date,
  targetDay: DayOfWeek,
  time?: {
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
  },
): Date {
  const result = new Date(date);
  const currentDay = result.getDay();
  const diff = targetDay - currentDay;

  result.setDate(result.getDate() + diff);

  result.setHours(
    time?.hours ?? 0,
    time?.minutes ?? 0,
    time?.seconds ?? 0,
    time?.milliseconds ?? 0,
  );

  return result;
}
