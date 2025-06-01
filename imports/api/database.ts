import { Mongo } from "meteor/mongo";

export interface DBEntry<T = string> {
  _id?: T;
}
