import { Meteor } from "meteor/meteor";
import { CommentsCollection } from "./CommentsCollection";
import { requireLoginPublish } from "../accounts/wrappers";

Meteor.publish(
  "comments",
  requireLoginPublish(function () {
    return CommentsCollection.find();
  }),
);
