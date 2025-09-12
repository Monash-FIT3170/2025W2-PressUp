import { Mongo } from "meteor/mongo";
import { DBEntry, OmitDB } from "../database";
import { NumbersToN } from "ts-number-range";

export type ShiftTime = {
  hour: NumbersToN<24>;
  minute: NumbersToN<60>;
};

export interface Shift extends DBEntry {
  user: string;
  date: Date;
  start: Date;
  end: Date;
  scheduledEnd?: Date; // This would be the planned end time
}

export const ShiftsCollection = new Mongo.Collection<OmitDB<Shift>, Shift>(
  "shifts",
);
