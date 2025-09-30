import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { ShiftsCollection } from "./ShiftsCollection";
import { requireLoginPublish } from "/imports/api/accounts/wrappers";
import { RoleEnum as PressUpRole } from "/imports/api/accounts/roles";

Meteor.publish(
  "shifts.all",
  requireLoginPublish(async function () {
    if (await Roles.userIsInRoleAsync(this.userId, [PressUpRole.MANAGER])) {
      return ShiftsCollection.find({});
    } else {
      return ShiftsCollection.find({
        user: this.userId,
      });
    }
  }),
);
