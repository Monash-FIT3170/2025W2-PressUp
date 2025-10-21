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

export function dateDifferenceDisplay(date: Date): string {
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `${Math.abs(diffDays)} days ago`;
  } else if (diffDays === 0) {
    return "Today";
  } else {
    return `In ${diffDays} days`;
  }
}
