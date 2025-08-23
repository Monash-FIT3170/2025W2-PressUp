import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { Roles } from "meteor/alanning:roles";
import { check, Match } from "meteor/check";
import { requireLoginMethod } from "./wrappers";
import { CreateUserData, UpdateUserProfileData } from "/imports/api/accounts/userTypes";
import { RoleEnum } from "./roles";
import { IdType } from "../database";

Meteor.methods({
  "users.create": requireLoginMethod(async function(userData: CreateUserData) {
    check(userData, {
      firstName: String,
      lastName: String,
      username: String,
      password: String,
      role: String
    });

    // check user level and authorisation
    if (!await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN, RoleEnum.MANAGER])) {
      throw new Meteor.Error("unauthorized", "Only admins and managers can create new users");
    }


    if (!Object.values(RoleEnum).includes(userData.role as RoleEnum)) {
      throw new Meteor.Error("invalid-role", "Invalid role specified");
    }

    if (await Meteor.users.findOneAsync({ username: userData.username })) {
      throw new Meteor.Error("username-exists", "A user with this username already exists");
    }

    try {
      const userId = await Accounts.createUserAsync({
        username: userData.username,
        password: userData.password,
        profile: {
          firstName: userData.firstName,
          lastName: userData.lastName
        }
      });

      await Roles.addUsersToRolesAsync(userId, [userData.role]);

      console.log(`Created user '${userData.username}' with role '${userData.role}'`);
      return userId;
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : String(error);
      throw new Meteor.Error("user-creation-failed", "Failed to create user: " + errorMessage);
    }
  }),

  "users.delete": requireLoginMethod(async function(userId: IdType) {
    check(userId, String);

    // only admins and managers can delete users
    if (!await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN, RoleEnum.MANAGER])) {
      throw new Meteor.Error("unauthorized", "Only admins and managers can delete users");
    }

    if (userId === this.userId) {
      throw new Meteor.Error("cannot-delete-self", "You cannot delete your own account");
    }

    const userToDelete = await Meteor.users.findOneAsync(userId);
    if (!userToDelete) {
      throw new Meteor.Error("user-not-found", "User not found");
    }

    try {
      const currentRoles = await Roles.getRolesForUserAsync(userId);
      if (currentRoles.length > 0) {
        await Roles.removeUsersFromRolesAsync(userId, currentRoles);
      }
      return await Meteor.users.removeAsync(userId);
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : String(error);
      throw new Meteor.Error("user-deletion-failed", "Failed to delete user: " + errorMessage);
    }
  }),

  "users.updateProfile": requireLoginMethod(async function(userId: IdType, profileData: UpdateUserProfileData) {
    check(userId, String);
    check(profileData, {
      firstName: Match.Optional(String),
      lastName: Match.Optional(String)
    });

    // check if user is admin or manager
    if (userId !== this.userId && !await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN, RoleEnum.MANAGER])) {
      throw new Meteor.Error("unauthorized", "You can only update your own profile");
    }

    const userToUpdate = await Meteor.users.findOneAsync(userId);
    if (!userToUpdate) {
      throw new Meteor.Error("user-not-found", "User not found");
    }

    try {
      return await Meteor.users.updateAsync(userId, {
        $set: {
          "profile.firstName": profileData.firstName || userToUpdate.profile?.firstName,
          "profile.lastName": profileData.lastName || userToUpdate.profile?.lastName
        }
      });
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : String(error);
      throw new Meteor.Error("profile-update-failed", "Failed to update profile: " + errorMessage);
    }
  }),

  "users.updateRole": requireLoginMethod(async function(userId: string, newRole: RoleEnum) {
    check(userId, String);
    check(newRole, String);

    // Only admins and managers can update roles
    if (!await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN, RoleEnum.MANAGER])) {
      throw new Meteor.Error("unauthorized", "Only admins and managers can update user roles");
    }

    // role validation
    if (!Object.values(RoleEnum).includes(newRole)) {
      throw new Meteor.Error("invalid-role", "Invalid role specified");
    }

    if (userId === this.userId && !await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN])) {
      throw new Meteor.Error("cannot-change-own-role", "You cannot change your own role");
    }

    const userToUpdate = await Meteor.users.findOneAsync(userId);
    if (!userToUpdate) {
      throw new Meteor.Error("user-not-found", "User not found");
    }

    try {
      const currentRoles = await Roles.getRolesForUserAsync(userId);
      if (currentRoles.length > 0) {
        await Roles.removeUsersFromRolesAsync(userId, currentRoles);
      }

      await Roles.addUsersToRolesAsync(userId, [newRole]);

      console.log(`Updated user '${userToUpdate.username}' role to '${newRole}'`);
      return true;
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : String(error);
      throw new Meteor.Error("role-update-failed", "Failed to update user role: " + errorMessage);
    }
  })
});
