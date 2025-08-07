import { Meteor } from "meteor/meteor";
import { AppUsersCollection } from "./AppUsersCollection";

Meteor.publish("users.all", function() {
    return AppUsersCollection.find({});
  });
