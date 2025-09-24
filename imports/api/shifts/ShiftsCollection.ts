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
}

export interface Shift extends DBEntry {
  user: string;
  date: Date;
  start: ShiftTime;
  end: ShiftTime | null;
  status: ShiftStatus;
}

export const ShiftsCollection = new Mongo.Collection<OmitDB<Shift>, Shift>(
  "shifts",
);
