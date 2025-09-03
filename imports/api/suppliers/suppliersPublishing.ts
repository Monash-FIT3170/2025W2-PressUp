import { Meteor } from "meteor/meteor";
import { SuppliersCollection } from "./SuppliersCollection";
import { requireLoginPublish } from "../accounts/wrappers";

Meteor.publish(
  "suppliers",
  requireLoginPublish(function () {
    return SuppliersCollection.find();
  }),
);
