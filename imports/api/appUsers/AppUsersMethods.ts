import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { AppUsersCollection } from "./AppUsersCollection"; // Your Mongo collection

Meteor.methods({
  "appUsers.insert"(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    group: "Manager" | "Casual";
    active: boolean;
  }) {
    // Validate fields
    check(userData.firstName, String);
    check(userData.lastName, String);
    check(userData.email, String);
    check(userData.password, String);
    check(userData.group, String);
    check(userData.active, Boolean);

  },

  "appUsers.delete"(userId: string) {
    check(userId, String);
    return AppUsersCollection.remove(userId);
  },

});
