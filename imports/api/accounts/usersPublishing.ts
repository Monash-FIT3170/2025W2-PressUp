import { Meteor } from "meteor/meteor";
import { requireLoginPublish } from "./wrappers";

Meteor.publish(
  "users.all",
  requireLoginPublish(function () {
    return Meteor.users.find(
      {},
      {
        fields: {
          _id: 1,
          username: 1,
        },
      },
    );
  }),
);
