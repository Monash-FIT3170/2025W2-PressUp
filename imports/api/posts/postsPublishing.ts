import { Meteor } from "meteor/meteor";
import { PostsCollection } from "./PostsCollection";
import { requireLoginPublish } from "../accounts/wrappers";

Meteor.publish(
  "posts",
  requireLoginPublish(function () {
    return PostsCollection.find();
  }),
);
