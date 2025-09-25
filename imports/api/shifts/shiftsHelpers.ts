import { Shift } from "./ShiftsCollection";

export function calculateShiftPay(shift: Shift, payRate: number): number {
  if (!shift.end) {
    return 0;
  }

  const durationMs = shift.end.getTime() - shift.start.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);

  if (durationHours <= 0) {
    return 0;
  }

  return payRate * durationHours;
}
