import { Meteor } from "meteor/meteor";
import { RoleEnum } from "./roles";

declare module "meteor/meteor" {
  namespace Meteor {
    interface UserProfile {
      firstName?: string;
      lastName?: string;
    }
  }
}

export interface ExtendedUser extends Meteor.User {
  profile?: {
    firstName: string;
    lastName: string;
  };
  roles?: string[];
  status?: {
    online: boolean;
    lastLogin?: {
      date: Date;
      ipAddr: string;
      userAgent: string;
    };
  };
}

export const UserRoles = RoleEnum;
export type UserRole = RoleEnum;

// New users
export interface CreateUserData {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  role: RoleEnum;
}

// Update users
export interface UpdateUserProfileData {
  firstName?: string;
  lastName?: string;
}
