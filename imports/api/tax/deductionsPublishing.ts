import { Meteor } from "meteor/meteor";
import { DeductionsCollection } from "./DeductionsCollection";
import { requireLoginPublish } from "../accounts/wrappers";

Meteor.publish(
  "deductions",
  requireLoginPublish(function () {
    return DeductionsCollection.find();
  }),
);
