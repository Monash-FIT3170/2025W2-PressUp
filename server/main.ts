import { Meteor } from "meteor/meteor";
import { mockDataGenerator } from "/imports/api/mockData";
import { createDefaultUser } from "/imports/api/accounts/defaultUser";
import "/imports/api/serverImports";
import { setupRoles } from "/imports/api/accounts/roles";

Meteor.startup(async () => {
  await setupRoles();
  await createDefaultUser();

  await mockDataGenerator({});
});

import "/imports/api/appUsers/AppUsersMethods"; 
import "/imports/api/appUsers/AppUsersCollection";