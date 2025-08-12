import { Mongo } from "meteor/mongo";
import { DBEntry } from "../database";

export interface Shift extends DBEntry {
  user: string;
  start: Date;
  end: Date;
}

export const ShiftsCollection = new Mongo.Collection<Shift>("shifts");
