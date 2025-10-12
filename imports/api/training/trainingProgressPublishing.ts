import { Meteor } from "meteor/meteor";
import { TrainingProgressCollection } from "./TrainingProgressCollection";
import { requireLoginPublish } from "../accounts/wrappers";

Meteor.publish(
  "trainingProgress.all",
  requireLoginPublish(function () {
    return TrainingProgressCollection.find();
  }),
);