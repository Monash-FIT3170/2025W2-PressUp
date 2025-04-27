import { Mongo } from "meteor/mongo";

export interface DBEntry {
  _id?: Mongo.ObjectID;
}
