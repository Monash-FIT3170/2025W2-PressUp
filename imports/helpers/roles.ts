import { Roles } from "meteor/alanning:roles";
import { IdType } from "../api/database";
import { RoleEnum } from "../api/accounts/roles";

export const getHighestRole = (userId: IdType) => {
  const roles = Roles.getRolesForUser(userId);
  for (const role of Object.values(RoleEnum)) {
    if (roles.includes(role)) return role;
  }
  return null;
};
