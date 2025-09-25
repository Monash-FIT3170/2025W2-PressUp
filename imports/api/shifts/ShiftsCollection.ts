import { Mongo } from "meteor/mongo";
import { DBEntry, OmitDB } from "../database";

export enum ShiftStatus {
  SCHEDULED = "scheduled",
  CLOCKED_IN = "clocked_in",
  CLOCKED_OUT = "clocked_out",
}

export interface Shift extends DBEntry {
  user: string;
  start: Date;
  end: Date | null;
  status: ShiftStatus;
}

export const ShiftsCollection = new Mongo.Collection<OmitDB<Shift>, Shift>(
  "shifts",
);
