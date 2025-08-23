import { RoleEnum } from "./roles";

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
