import { Roles } from "meteor/alanning:roles";

export enum PressUpRole {
  ADMIN = "admin",
}

export const setupRoles = async () => {
  await Roles.createRoleAsync(PressUpRole.ADMIN, { unlessExists: true });
};
