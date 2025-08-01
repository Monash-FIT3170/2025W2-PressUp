import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";

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
    Accounts.createUser({
      username,
      password,
    });
    console.log(`Created default user '${username}'`);
  }
};
