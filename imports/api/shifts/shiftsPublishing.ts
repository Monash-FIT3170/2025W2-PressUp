import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { ShiftsCollection, ShiftStatus } from "./ShiftsCollection";
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
        date: { $gte: startDate, $lte: endDate },
      });
    }

    return ShiftsCollection.find({
      date: { $gte: startDate, $lte: endDate },
    });
  }),
);

// publish active shifts (clocked in)
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
        status: ShiftStatus.CLOCKED_IN,
      });
    }

    // for managers and admins to see all active shifts
    return ShiftsCollection.find({
      status: ShiftStatus.CLOCKED_IN,
    });
  }),
);

// publish scheduled shifts for roster planning
Meteor.publish(
  "shifts.scheduled",
  requireLoginPublish(async function (startDate?: Date, endDate?: Date) {
    const dateFilter =
      startDate && endDate ? { date: { $gte: startDate, $lte: endDate } } : {};

    if (
      !(await Roles.userIsInRoleAsync(this.userId, [
        PressUpRole.ADMIN,
        PressUpRole.MANAGER,
      ]))
    ) {
      return ShiftsCollection.find({
        user: this.userId,
        status: ShiftStatus.SCHEDULED,
        ...dateFilter,
      });
    }

    // for managers and admins to see all scheduled shifts
    return ShiftsCollection.find({
      status: ShiftStatus.SCHEDULED,
      ...dateFilter,
    });
  }),
);
