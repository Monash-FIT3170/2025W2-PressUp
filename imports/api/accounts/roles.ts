import { Roles } from "meteor/alanning:roles";

export enum RoleEnum {
  ADMIN = "Admin",
  MANAGER = "Manager",
  CASUAL = "Casual",
}

export const roleColors: Record<string, string> = {
  [RoleEnum.ADMIN]: "#dc2626", // Red
  [RoleEnum.MANAGER]: "#f59e0b", // Amber
  [RoleEnum.CASUAL]: "#10b981", // Emerald
};

export const setupRoles = async () => {
  await Roles.createRoleAsync(RoleEnum.ADMIN, { unlessExists: true });
  await Roles.createRoleAsync(RoleEnum.MANAGER, { unlessExists: true });
  await Roles.createRoleAsync(RoleEnum.CASUAL, { unlessExists: true });

  // Create hierarchy (e.g. Admin can do whatever roles below them can do)
  await Roles.addRolesToParentAsync(RoleEnum.MANAGER, RoleEnum.ADMIN);
  await Roles.addRolesToParentAsync(RoleEnum.CASUAL, RoleEnum.MANAGER);
};

export const getHighestRole = (roles: string[]): string | null => {
  if (!roles || roles.length === 0) return null;

  const roleHierarchy = Object.values(RoleEnum);

  for (const role of roleHierarchy) {
    if (roles.includes(role)) {
      return role;
    }
  }

  return roles[0];
};
