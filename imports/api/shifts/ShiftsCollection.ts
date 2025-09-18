import { Mongo } from "meteor/mongo";
import { DBEntry, OmitDB } from "../database";
import { NumbersToN } from "ts-number-range";

export type ShiftTime = {
  hour: NumbersToN<24>;
  minute: NumbersToN<60>;
};

export enum ShiftStatus {
  SCHEDULED = "scheduled",
  CLOCKED_IN = "clocked_in",
  CLOCKED_OUT = "clocked_out",
  COMPLETED = "completed",
}

export interface Shift extends DBEntry {
  user: string;
  date: Date;
  start: ShiftTime;
  end?: ShiftTime;
  scheduledEnd?: ShiftTime;
  status: ShiftStatus;
}

export const ShiftsCollection = new Mongo.Collection<OmitDB<Shift>, Shift>(
  "shifts",
);

export const shiftTimeUtils = {
  toDate(date: Date, shiftTime: ShiftTime): Date {
    const result = new Date(date);
    result.setHours(shiftTime.hour, shiftTime.minute, 0, 0);
    return result;
  },
  fromDate(date: Date): ShiftTime {
    return {
      hour: date.getHours() as NumbersToN<24>,
      minute: date.getMinutes() as NumbersToN<60>,
    };
  },

  now(): ShiftTime {
    return this.fromDate(new Date());
  },

  isCurrentTimeInShift(shift: Shift): boolean {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const shiftDate = new Date(shift.date);
    shiftDate.setHours(0, 0, 0, 0);
    if (shiftDate.getTime() !== today.getTime()) {
      return false;
    }

    const shiftStart = this.toDate(shift.date, shift.start);
    const shiftEnd = shift.scheduledEnd
      ? this.toDate(shift.date, shift.scheduledEnd)
      : this.toDate(shift.date, shift.end!);

    return now >= shiftStart && now <= shiftEnd;
  },

  format(shiftTime: ShiftTime): string {
    return `${shiftTime.hour.toString().padStart(2, "0")}:${shiftTime.minute.toString().padStart(2, "0")}`;
  },
};
