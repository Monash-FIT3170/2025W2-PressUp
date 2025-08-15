import { Roles } from "meteor/alanning:roles";

export enum PressUpRole {
  ADMIN = "admin",
  MANAGER = "manager",
  STAFF = "staff",
}

export const setupRoles = async () => {
  for (const role of Object.values(PressUpRole)) {
    await Roles.createRoleAsync(role, { unlessExists: true });
  }
};
