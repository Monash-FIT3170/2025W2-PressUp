import { Meteor } from "meteor/meteor";
import { mockDataGenerator } from "/imports/api/mockData";
import { createDefaultUser } from "/imports/api/accounts/defaultUser";
import "/imports/api/serverImports";

Meteor.startup(async () => {
  await createDefaultUser();
  await mockDataGenerator({});
});
