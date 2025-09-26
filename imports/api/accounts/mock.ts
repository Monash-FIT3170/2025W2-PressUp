import { Accounts } from "meteor/accounts-base";
import { Roles } from "meteor/alanning:roles";
import { Meteor } from "meteor/meteor";
import { faker } from "@faker-js/faker";
import { RoleEnum } from "./roles";

export const mockAccounts = async (count: number = 30) => {
  if ((await Meteor.users.find().countAsync()) > 1) return;

  const roles = [RoleEnum.CASUAL, RoleEnum.MANAGER, RoleEnum.ADMIN];
  const defaultPassword =
    process.env.DEFAULT_PASS ||
    Meteor.settings?.private?.defaultUser?.password ||
    "changeme";

  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${faker.number.int({ min: 1, max: 99 })}`;
    const role = faker.helpers.arrayElement(roles);

    const userId = await Accounts.createUserAsync({
      username,
      password: defaultPassword,
      profile: {
        firstName,
        lastName,
      },
    });

    await Roles.addUsersToRolesAsync(userId, [role]);

    await Meteor.users.updateAsync(userId, {
      $set: {
        payRate: faker.number.float({ min: 15, max: 35, fractionDigits: 2 }),
      },
    });
  }
};
