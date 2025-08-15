// server/publications/users.ts
import { Meteor } from "meteor/meteor";

Meteor.publish("users.all", function () {
  // return Meteor.users.find({}, { fields: { username: 1, profile: 1, roles: 1 } });
  return Meteor.users.find({}, { fields: { username: 1, roles: 1 } });
});