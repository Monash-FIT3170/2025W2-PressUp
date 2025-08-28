import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { PressUpRole } from "./roles";
import { requireLoginMethod } from "./wrappers";

Meteor.methods({
  "accounts.setRole": requireLoginMethod(async function (userId: string, role: PressUpRole) {
    if (!Object.values(PressUpRole).includes(role)) {
      throw new Meteor.Error("invalid-role", "Role not recognized");
    }
    if (!this.userId || !Roles.userIsInRole(this.userId, PressUpRole.ADMIN)) {
      throw new Meteor.Error("forbidden", "Only admins can change roles");
    }
    await Roles.setUserRolesAsync(userId, [role]);
  }),
  "accounts.setUserRoles": requireLoginMethod(async function (userId: string, roles: PressUpRole[]) {
    const validRoles = Object.values(PressUpRole);
    if (!Array.isArray(roles) || roles.some((r) => !validRoles.includes(r))) {
      throw new Meteor.Error("invalid-role", "One or more roles are not recognized");
    }

    if (!this.userId || !Roles.userIsInRole(this.userId, PressUpRole.ADMIN)) {
      throw new Meteor.Error("forbidden", "Only admins can change roles");
    }

    const removingAdmin = !(roles as string[]).includes(PressUpRole.ADMIN);
    if (removingAdmin) {
      const currentAdmins = await Meteor.users
        .rawCollection()
        .find({ roles: PressUpRole.ADMIN })
        .toArray();
      const numAdmins = currentAdmins.length;
      const isTargetCurrentlyAdmin = await Roles.userIsInRoleAsync(userId, PressUpRole.ADMIN);
      if (isTargetCurrentlyAdmin && numAdmins <= 1) {
        throw new Meteor.Error("forbidden", "Cannot remove the last admin user");
      }
    }

    await Roles.setUserRolesAsync(userId, roles as string[]);
  }),
});