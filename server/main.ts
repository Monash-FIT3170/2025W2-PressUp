import { Meteor } from "meteor/meteor";
import { mockDataGenerator } from "/imports/api/mockData";
import "/imports/api";

Meteor.startup(async () => {
  mockDataGenerator({});
});
