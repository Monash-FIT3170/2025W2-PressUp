import { Mongo } from "meteor/mongo";
import { DBEntry, IdType, OmitDB } from "../database";

type CompletedItems = {
  [itemId: string]: boolean;
};

export interface TrainingProgress extends DBEntry {
  staffId: IdType;
  trainingListId: IdType;
  completedItems: CompletedItems; // Array of item IDs that have been completed
}

export const TrainingProgressCollection = new Mongo.Collection<
  OmitDB<TrainingProgress>,
  TrainingProgress
>("trainingProgress");
