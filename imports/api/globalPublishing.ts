import { Meteor } from "meteor/meteor";
import { requireLoginPublish } from "./accounts/wrappers";

// Subscription for essential app data
Meteor.publish(
  null,
  requireLoginPublish(async function () {
    return [
      Meteor.roleAssignment.find({}),
      Meteor.roles.find({}, { fields: { _id: 1, children: 1, parents: 1 } }),
    ];
  }),
);
