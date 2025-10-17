import { Meteor } from "meteor/meteor";
import { TrainingListsCollection } from "./TrainingListsCollection";
import { requireLoginPublish } from "../accounts/wrappers";

Meteor.publish(
  "trainingLists.all",
  requireLoginPublish(function () {
    return TrainingListsCollection.find();
  }),
);
