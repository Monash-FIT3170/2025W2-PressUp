import { Meteor } from "meteor/meteor";
import { createDefaultUser } from "/imports/api/accounts/defaultUser";
import "/imports/api/serverImports";
import { setupRoles } from "/imports/api/accounts/roles";

Meteor.startup(async () => {
  await setupRoles();
  await createDefaultUser();
});
