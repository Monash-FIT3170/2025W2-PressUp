import { Meteor } from "meteor/meteor";
import { mockDataGenerator } from "/imports/api/mockData";
import "/imports/api/serverImports";

Meteor.startup(async () => {
  mockDataGenerator({});
});
