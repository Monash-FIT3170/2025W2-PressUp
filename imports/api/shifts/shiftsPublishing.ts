import { Meteor } from "meteor/meteor";
import { ShiftsCollection } from "./ShiftsCollection";
import { requireLoginPublish } from "../accounts/wrappers";

Meteor.publish(
  "shifts.all",
  requireLoginPublish(function () {
    return ShiftsCollection.find();
  }),
);
