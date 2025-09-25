import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { requireLoginMethod } from "../accounts/wrappers";
import { ShiftsCollection, ShiftStatus, ShiftTime } from "./ShiftsCollection";
import { Roles } from "meteor/alanning:roles";
import { RoleEnum } from "../accounts/roles";
import { NumbersToN } from "ts-number-range";

Meteor.methods({
  "shifts.schedule": requireLoginMethod(async function ({
    userId,
    start,
    end,
  }: {
    userId: string;
    start: Date;
    end: Date;
  }) {
    check(userId, String);
    check(start, Date);
    check(end, Date);

    if (!(await Roles.userIsInRoleAsync(Meteor.userId(), [RoleEnum.MANAGER]))) {
      throw new Meteor.Error(
        "invalid-permissions",
        "No permissions to publish a shift",
      );
    }

    const userExists = !!(await Meteor.users.findOneAsync(
      { _id: userId },
      { fields: { _id: 1 } },
    ));
    if (!userExists) {
      throw new Meteor.Error("invalid-user", "No user found with the given ID");
    }

    if (end <= start) {
      throw new Meteor.Error(
        "invalid-time-range",
        "End time must be after start time",
      );
    }

    // Error if there is an overlapping shift with a non-schedule status
    const trueOverlaps = await ShiftsCollection.find({
      user: userId,
      start: { $lt: end },
      end: { $gt: start },
      status: { $ne: ShiftStatus.SCHEDULED },
    }).fetchAsync();

    if (trueOverlaps.length > 0) {
      throw new Meteor.Error(
        "shift-overlap-error",
        "Cannot schedule shift that overlaps with non-scheduled shifts",
      );
    }

    // Find scheduled shifts that overlap (within 1 minute) for merging
    const existingShifts = await ShiftsCollection.find({
      user: userId,
      status: ShiftStatus.SCHEDULED,
      $or: [
        // Real overlaps
        {
          start: { $lt: end },
          end: { $gt: start },
        },
        // Within 1 minute
        {
          end: {
            $gte: new Date(start.getTime() - 60000),
            $lte: new Date(start.getTime() + 60000),
          },
        },
        {
          start: {
            $gte: new Date(end.getTime() - 60000),
            $lte: new Date(end.getTime() + 60000),
          },
        },
      ],
    }).fetchAsync();

    // Merge overlapping shifts
    if (existingShifts.length > 0) {
      const allShifts = [...existingShifts, { start, end }];
      const mergedStart = new Date(
        Math.min(...allShifts.map((s) => s.start.getTime())),
      );
      const mergedEnd = new Date(
        Math.max(...allShifts.map((s) => s.end!.getTime())),
      );

      for (const shift of existingShifts) {
        await ShiftsCollection.removeAsync(shift._id);
      }

      return await ShiftsCollection.insertAsync({
        user: userId,
        start: mergedStart,
        end: mergedEnd,
        status: ShiftStatus.SCHEDULED,
      });
    }

    return await ShiftsCollection.insertAsync({
      user: userId,
      start,
      end,
      status: ShiftStatus.SCHEDULED,
    });
  }),

  "shifts.clockIn": requireLoginMethod(async function () {
    const userId = this.userId;

    if (!userId) {
      throw new Meteor.Error("no-user", "Not logged in");
    }

    // Error if existing clocked in shift
    const active = await ShiftsCollection.findOneAsync({
      user: userId,
      status: ShiftStatus.CLOCKED_IN,
    });

    if (active) {
      throw new Meteor.Error(
        "already-clocked-in",
        "You are already clocked in",
      );
    }

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const tomorrowStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );

    const nowShiftTime: ShiftTime = {
      hour: now.getHours() as NumbersToN<24>,
      minute: now.getMinutes() as NumbersToN<60>,
    };

    const scheduled = await ShiftsCollection.findOneAsync({
      user: userId,
      status: ShiftStatus.SCHEDULED,
      date: { $gte: todayStart, $lt: tomorrowStart },
    });

    if (scheduled) {
      return await ShiftsCollection.updateAsync(scheduled._id, {
        start: nowShiftTime,
        end: scheduled.end
          ? scheduled.end.hour < nowShiftTime.hour &&
            scheduled.end.minute < nowShiftTime.minute
            ? null
            : scheduled.end
          : scheduled.end,
        status: ShiftStatus.CLOCKED_IN,
      });
    }

    return await ShiftsCollection.insertAsync({
      user: userId,
      date: todayStart,
      start: nowShiftTime,
      end: null,
      status: ShiftStatus.CLOCKED_IN,
    });
  }),

  "shifts.clockOut": requireLoginMethod(async function () {
    const userId = this.userId;

    if (!userId) {
      throw new Meteor.Error("no-user", "Not logged in");
    }

    // Find the user's active shift
    const active = await ShiftsCollection.findOneAsync({
      user: userId,
      status: ShiftStatus.CLOCKED_IN,
    });

    if (!active) {
      throw new Meteor.Error("not-clocked-in", "You are not clocked in");
    }

    const now = new Date();

    const isToday =
      active.date.getFullYear() === now.getFullYear() &&
      active.date.getMonth() === now.getMonth() &&
      active.date.getDate() === now.getDate();

    const endTime: ShiftTime = isToday
      ? {
          hour: now.getHours() as NumbersToN<24>,
          minute: now.getMinutes() as NumbersToN<60>,
        }
      : {
          hour: 23 as NumbersToN<24>,
          minute: 59 as NumbersToN<60>,
        };

    await ShiftsCollection.updateAsync(active._id, {
      $set: {
        end: endTime,
        status: ShiftStatus.CLOCKED_OUT,
      },
    });

    return active._id;
  }),
});
