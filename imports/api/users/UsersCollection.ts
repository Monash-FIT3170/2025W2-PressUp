import { Mongo } from "meteor/mongo";


export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  group: "Manager" | "Casual";
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const UsersCollection = new Mongo.Collection<User>("users");