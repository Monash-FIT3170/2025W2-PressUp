import { Meteor } from "meteor/meteor";
import { createDefaultUser } from "/imports/api/accounts/defaultUser";
import { createDefaultCompany } from "/imports/api/company/defaultCompany";
import "/imports/api/serverImports";
import { setupRoles } from "/imports/api/accounts/roles";

Meteor.startup(async () => {
  await setupRoles();
  await createDefaultUser();
  await createDefaultCompany();
});
