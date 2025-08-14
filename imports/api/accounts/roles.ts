import { Roles } from "meteor/alanning:roles";

export enum PressUpRole {
  ADMIN = "admin",
  MANAGER = "manager",
  CASUAL = "casual"
}

export const setupRoles = async () => {
  await Roles.createRoleAsync(PressUpRole.ADMIN, { unlessExists: true });
  await Roles.createRoleAsync(PressUpRole.MANAGER, { unlessExists: true });
  await Roles.createRoleAsync(PressUpRole.CASUAL, { unlessExists: true });

  // Create hierarchy (e.g. Admin can do whatever roles below them can do)
  await Roles.addUsersToRolesAsync(PressUpRole.MANAGER, PressUpRole.ADMIN)
  await Roles.addUsersToRolesAsync(PressUpRole.CASUAL, PressUpRole.MANAGER)
};
