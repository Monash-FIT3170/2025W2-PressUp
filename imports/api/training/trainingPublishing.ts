import { Meteor } from "meteor/meteor";
import { TrainingListsCollection } from "./TrainingListsCollection";
import { TrainingProgressCollection } from "./TrainingProgressCollection";
import { requireLoginPublish } from "../accounts/wrappers";

Meteor.publish(
  "TrainingLists.all",
  requireLoginPublish(function () {
    return TrainingListsCollection.find();
  }),
);

Meteor.publish(
  "TrainingProgress.all",
  requireLoginPublish(function () {
    return TrainingProgressCollection.find();
  }),
);