import { Accounts } from "meteor/accounts-base";
import { Roles } from "meteor/alanning:roles";
import { Meteor } from "meteor/meteor";
import { PressUpRole } from "./roles";

export const createDefaultUser = async () => {
  const username =
    process.env.DEFAULT_USERNAME ||
    Meteor.settings?.private?.defaultUser?.username ||
    "admin";
  const password =
    process.env.DEFAULT_PASS ||
    Meteor.settings?.private?.defaultUser?.password ||
    "changeme";

  const existing = await Meteor.users.findOneAsync({ username });
  if (existing) {
    await Roles.addUsersToRolesAsync(existing._id, PressUpRole.ADMIN);
    await Roles.setUserRolesAsync(existing._id, PressUpRole.ADMIN);
    return;
  }

  const userId = await Accounts.createUserAsync({ username, password });
  await Roles.addUsersToRolesAsync(userId, PressUpRole.ADMIN);
  await Roles.setUserRolesAsync(userId, PressUpRole.ADMIN);
};

export const deleteUser = async () => {};
