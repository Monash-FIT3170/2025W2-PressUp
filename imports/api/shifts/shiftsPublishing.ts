import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { ShiftsCollection } from "./ShiftsCollection";
import { requireLoginPublish } from "/imports/api/accounts/wrappers";
import { RoleEnum as PressUpRole } from "/imports/api/accounts/roles";

Meteor.publish(
  "shifts.current",
  requireLoginPublish(function () {
    return ShiftsCollection.find({
      user: this.userId,
    });
  }),
);

// for admins and manager: publish all users shifts
Meteor.publish(
  "shifts.all",
  requireLoginPublish(async function () {
    if (
      !(await Roles.userIsInRoleAsync(this.userId, [
        PressUpRole.ADMIN,
        PressUpRole.MANAGER,
      ]))
    ) {
      this.ready();
      return;
    }

    return ShiftsCollection.find({});
  }),
);

Meteor.publish(
  "shifts.dateRange",
  requireLoginPublish(async function (startDate: Date, endDate: Date) {
    if (
      !(await Roles.userIsInRoleAsync(this.userId, [
        PressUpRole.ADMIN,
        PressUpRole.MANAGER,
      ]))
    ) {
      return ShiftsCollection.find({
        user: this.userId,
        $or: [
          {
            start: { $gte: startDate, $lte: endDate },
          },
          {
            end: { $gte: startDate, $lte: endDate },
          },
          {
            start: { $lte: startDate },
            $or: [{ end: { $gte: endDate } }, { end: { $exists: false } }],
          },
        ],
      });
    }

    return ShiftsCollection.find({
      $or: [
        {
          start: { $gte: startDate, $lte: endDate },
        },
        {
          end: { $gte: startDate, $lte: endDate },
        },
        {
          start: { $lte: startDate },
          $or: [{ end: { $gte: endDate } }, { end: { $exists: false } }],
        },
      ],
    });
  }),
);

// publish active shifts
Meteor.publish(
  "shifts.active",
  requireLoginPublish(async function () {
    if (
      !(await Roles.userIsInRoleAsync(this.userId, [
        PressUpRole.ADMIN,
        PressUpRole.MANAGER,
      ]))
    ) {
      return ShiftsCollection.find({
        user: this.userId,
        end: { $exists: false },
      });
    }

    // for managers and admins to see all active shifts
    return ShiftsCollection.find({
      end: { $exists: false },
    });
  }),
);
