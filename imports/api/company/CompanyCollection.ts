import { Mongo } from "meteor/mongo";
import { DBEntry, OmitDB } from "../database";

export interface Company extends DBEntry {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  abn?: string;
}

export const CompanyCollection = new Mongo.Collection<OmitDB<Company>, Company>(
  "company",
);

// Singleton ID, we use this to ensure only 1 instance of "Company" exists in the database at a time
export const COMPANY_ID = "company-settings";
