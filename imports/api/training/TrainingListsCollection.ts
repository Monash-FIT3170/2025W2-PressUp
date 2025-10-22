import { Mongo } from "meteor/mongo";
import { DBEntry, OmitDB } from "../database";

export interface TrainingList extends DBEntry {
  title: string;
  items: { id: string; name: string }[];
}

export const TrainingListsCollection = new Mongo.Collection<
  OmitDB<TrainingList>,
  TrainingList
>("trainingLists");
