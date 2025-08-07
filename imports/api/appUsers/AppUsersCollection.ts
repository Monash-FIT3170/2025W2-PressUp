import { Mongo } from "meteor/mongo";

export interface AppUser {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  group: "Manager" | "Casual";
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const AppUsersCollection = new Mongo.Collection<AppUser>("appUsers");
