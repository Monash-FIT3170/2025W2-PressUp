import { Mongo } from "meteor/mongo";
import { DBEntry, OmitDB } from "../database";
import { NumbersToN } from "ts-number-range";

export type ShiftTime = {
  hour: NumbersToN<24>;
  minute: NumbersToN<60>;
};

export interface Shift extends DBEntry {
  user: string;
<<<<<<< HEAD
  start: Date;
  end: Date;
  scheduledEnd?: Date; // This would be the planned end time
=======
  date: Date;
  start: ShiftTime;
  end: ShiftTime;
>>>>>>> 64cac7a5e19c32a4a58f5efe769f9f4c5198e0a0
}

export const ShiftsCollection = new Mongo.Collection<OmitDB<Shift>, Shift>(
  "shifts",
);
