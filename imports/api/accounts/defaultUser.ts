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

  // Try to find existing user
  let user = await Meteor.users.findOneAsync({ username });

  // If not found, create
  if (!user) {
    const userId = await Accounts.createUserAsync({ username, password });
    console.log(`Created default user '${username}'`);

    user = await Meteor.users.findOneAsync(userId); // fetch full user doc
  }

  // Ensure role is set
  if (!(await Roles.userIsInRoleAsync(user._id, PressUpRole.ADMIN))) {
    await Roles.addUsersToRolesAsync(user._id, PressUpRole.ADMIN);
    console.log(`Assigned '${username}' as ADMIN`);
  }
};