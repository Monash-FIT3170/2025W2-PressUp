import { Roles } from "meteor/alanning:roles";

export enum RoleEnum {
  ADMIN = "admin",
  MANAGER = "manager",
  CASUAL = "casual",
}

export const setupRoles = async () => {
  await Roles.createRoleAsync(RoleEnum.ADMIN, { unlessExists: true });
  await Roles.createRoleAsync(RoleEnum.MANAGER, { unlessExists: true });
  await Roles.createRoleAsync(RoleEnum.CASUAL, { unlessExists: true });

  // Create hierarchy (e.g. Admin can do whatever roles below them can do)
  await Roles.addRolesToParentAsync(RoleEnum.MANAGER, RoleEnum.ADMIN);
  await Roles.addRolesToParentAsync(RoleEnum.CASUAL, RoleEnum.MANAGER);
};
