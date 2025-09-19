import "/imports/api/serverImports";
import { Meteor } from "meteor/meteor";
import { setupRoles } from "/imports/api/accounts/roles";
import { createDefaultUser } from "/imports/api/accounts/defaultUser";
import { mockDataGenerator } from "/imports/api/mockData";

Meteor.startup(async () => {
  await setupRoles();
  await createDefaultUser();

  await mockDataGenerator({});
});
