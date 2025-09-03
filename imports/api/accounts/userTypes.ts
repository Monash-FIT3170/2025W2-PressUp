// New users
export interface CreateUserData {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  role: string;
  payRate?: number;
}

// Update users
export interface UpdateUserProfileData {
  firstName?: string;
  lastName?: string;
  payRate?: number;
}
