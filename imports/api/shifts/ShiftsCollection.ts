import { Mongo } from "meteor/mongo";
import { DBEntry, OmitDB } from "../database";

export enum ShiftStatus {
  SCHEDULED = "Scheduled",
  CLOCKED_IN = "Clocked In",
  CLOCKED_OUT = "Clocked Out",
}

export interface Shift extends DBEntry {
  user: string;
  start: Date;
  end: Date | null;
  status: ShiftStatus;
}

export const ShiftsCollection = new Mongo.Collection<
  OmitDB<Shift> | Shift,
  Shift
>("shifts");
