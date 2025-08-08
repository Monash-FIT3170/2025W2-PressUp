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

  if (!(await Meteor.users.findOneAsync({ username }))) {
    const userId = await Accounts.createUserAsync({
      username,
      password,
    });
    await Roles.addUsersToRolesAsync(userId, PressUpRole.ADMIN);

    console.log(`Created default user '${username}'`);
  }
};
