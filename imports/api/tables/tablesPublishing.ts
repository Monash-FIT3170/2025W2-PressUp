import { Meteor } from "meteor/meteor";
import { TablesCollection } from "./TablesCollection";
import { requireLoginPublish } from "../accounts/wrappers";

Meteor.publish(
  "tables",
  requireLoginPublish(function () {
    return TablesCollection.find();
  }),
);
