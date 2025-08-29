import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { requireLoginPublish } from "./wrappers";
import { RoleEnum } from "./roles";

// publish all users data for admin and manager
Meteor.publish(
  "users.all",
  requireLoginPublish(async function () {
    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.MANAGER]))) {
      this.ready();
      return;
    }

    return Meteor.users.find(
      {},
      {
        fields: {
          username: 1,
          profile: 1,
          status: 1,
          createdAt: 1,
        },
      },
    );
  }),
);

// publish the current user's data
Meteor.publish(
  "users.current",
  requireLoginPublish(function () {
    return Meteor.users.find(this.userId, {
      fields: {
        username: 1,
        profile: 1,
        status: 1,
        createdAt: 1,
      },
    });
  }),
);

Meteor.publish(
  "users.roles",
  requireLoginPublish(async function () {
      return Meteor.roleAssignment.find({});
    })
);

// Used by the client to determine role hierarchy
Meteor.publish(
  "users.rolesGraph",
  requireLoginPublish(async function () {
    return Meteor.roles.find(
      {},
      { fields: { _id: 1, children: 1, parents: 1 } },
    );
  }),
);
