import { Mongo } from "meteor/mongo";
import { DBEntry } from "../database";

export interface Shift extends DBEntry {
  user: string;
  start: Date;
  end: Date;
  scheduledEnd?: Date; // This would be the planned end time
}

export const ShiftsCollection = new Mongo.Collection<Shift>("shifts");
