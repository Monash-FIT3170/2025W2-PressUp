// New users
export interface CreateUserData {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  role: string;
}

// Update users
export interface UpdateUserProfileData {
  firstName?: string;
  lastName?: string;
}
