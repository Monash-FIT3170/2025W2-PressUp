import { Mongo } from "meteor/mongo";
import { DBEntry, OmitDB } from "../database";

export interface Deduction extends DBEntry {
  name: string;
  date: Date;
  description?: string;
  amount: number;
}

export const DeductionsCollection = new Mongo.Collection<OmitDB<Deduction>, Deduction>(
  "deductions",
);