import { Meteor } from "meteor/meteor";
import { mockDataGenerator } from "/imports/api/mockData";
import { createDefaultUser, deleteUser } from "/imports/api/accounts/defaultUser";
import "/imports/api/serverImports";
import { setupRoles } from "/imports/api/accounts/roles";
import "/imports/api/accounts/accountMethods";

Meteor.startup(async () => {
  await deleteUser();
  console.log("Started");
  await setupRoles();
  await createDefaultUser();

  await mockDataGenerator({});
});
