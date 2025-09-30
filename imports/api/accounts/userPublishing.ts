import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { requireLoginPublish } from "./wrappers";
import { RoleEnum } from "./roles";

Meteor.publish(
  "users.all",
  requireLoginPublish(async function () {
    const fields = {
      username: 1,
      profile: 1,
      status: 1,
      createdAt: 1,
      payRate: 1,
    };

    if (await Roles.userIsInRoleAsync(this.userId, [RoleEnum.MANAGER])) {
      return Meteor.users.find({}, { fields });
    } else {
      return Meteor.users.find(this.userId, { fields });
    }
  }),
);
