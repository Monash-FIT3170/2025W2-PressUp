import { Mongo } from "meteor/mongo";
import { DBEntry, IdType, OmitDB } from "../database";

export interface TableBooking {
  bookingDate: Date;
  partySize: number;
  customerName: string;
  customerPhone: string;
  notes?: string;
}

export interface Tables extends DBEntry {
  tableNo: number;
  activeOrderID: IdType | null;
  orderIDs: IdType[] | null;
  capacity: number;
  isOccupied: boolean;
  noOccupants?: number;
  bookings?: TableBooking[];
}

export const TablesCollection = new Mongo.Collection<OmitDB<Tables>, Tables>(
  "tables",
);
