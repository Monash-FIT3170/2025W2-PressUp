import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { PressUpRole } from "./roles";
import { requireLoginMethod } from "./wrappers";

Meteor.methods({
  "accounts.setRole": requireLoginMethod(async function (userId: string, role: PressUpRole) {
    if (!Object.values(PressUpRole).includes(role)) {
      throw new Meteor.Error("invalid-role", "Role not recognized");
    }
    Roles.addUsersToRolesAsync(userId, [role]);
  }),
});