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

  console.log(`Creating default user '${username}'`);

  // if (!(await Meteor.users.findOneAsync({ username }))) {
  //   const userId = await Accounts.createUserAsync({
  //     username,
  //     password,
  //   });
  //   await Roles.addUsersToRolesAsync(userId, PressUpRole.ADMIN);

  //   console.log(`Assigned role '${PressUpRole.ADMIN}' to default user '${userId}'`);
  // }

  const userId = await Accounts.createUserAsync({
      username,
      password,
    });
    console.log(`Created user with ID: ${userId}`);
    await Roles.addUsersToRolesAsync(userId, PressUpRole.ADMIN);
    console.log(await Roles.getRolesForUserAsync(userId));
};

export const deleteUser = async () => {
  const userId =
    process.env.DEFAULT_USERNAME ||
    Meteor.settings?.private?.defaultUser?.username ||
    "admin";

  console.log(`Deleting default user '${userId}'`);

  const user = await Meteor.users.findOneAsync({ username: userId });
  if (user) {
    await Meteor.users.removeAsync(user._id);
    console.log(`Deleted default user '${userId}'`);
  }
};
