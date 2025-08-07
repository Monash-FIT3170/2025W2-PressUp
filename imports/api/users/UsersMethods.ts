
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";   
import { User } from "./UsersCollection";
export const UsersCollection = new Mongo.Collection<User>("users");

if (Meteor.isServer) {
  Meteor.methods({
    'users.insert'(userData: Omit<User, '_id'> & { password: string }) {
      // Add user creation logic here
      return UsersCollection.insert({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    },

    'users.update'(userId: string, userData: Partial<User>) {
      return UsersCollection.update(userId, {
        $set: {
          ...userData,
          updatedAt: new Date(),
        },
      });
    },

    'users.remove'(userId: string) {
      return UsersCollection.remove(userId);
    },

    'users.removeMultiple'(userIds: string[]) {
      return UsersCollection.remove({ _id: { $in: userIds } });
    },
  });}
  