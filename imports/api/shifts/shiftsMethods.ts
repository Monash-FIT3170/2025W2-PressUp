import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { requireLoginMethod } from "../accounts/wrappers";
import { ShiftsCollection, ShiftStatus } from "./ShiftsCollection";
import { Roles } from "meteor/alanning:roles";
import { RoleEnum } from "../accounts/roles";

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

    // Update overlapping shift condition
    const overlappingShift = await ShiftsCollection.findOneAsync({
      user: userId,
      status: ShiftStatus.SCHEDULED,
      start: { $lte: now },
      end: { $gte: now },
    });

    if (overlappingShift) {
      return await ShiftsCollection.updateAsync(overlappingShift._id, {
        start: now,
        end:
          overlappingShift.end && overlappingShift.end <= now
            ? null
            : overlappingShift.end,
        status: ShiftStatus.CLOCKED_IN,
      });
    }

    return await ShiftsCollection.insertAsync({
      user: userId,
      start: now,
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

    // Remove overlapping shifts
    const overlappingShifts = await ShiftsCollection.find({
      user: userId,
      $or: [
        {
          start: { $gte: active.start, $lte: now },
        },
        {
          end: { $gte: active.start, $lte: now },
        },
        {
          start: { $lte: active.start },
          end: { $gte: now },
        },
      ],
    }).fetchAsync();

    for (const shift of overlappingShifts.filter((s) => s._id !== active._id)) {
      await ShiftsCollection.removeAsync(shift._id);
    }

    // Update active shift
    await ShiftsCollection.updateAsync(active._id, {
      $set: {
        end: now,
        status: ShiftStatus.CLOCKED_OUT,
      },
    });

    return active._id;
  }),

  "shifts.edit": requireLoginMethod(async function ({
    shiftId,
    userId,
    start,
    end,
  }: {
    shiftId: string;
    userId: string;
    start: Date;
    end: Date;
  }) {
    check(shiftId, String);
    check(userId, String);
    check(start, Date);
    check(end, Date);

    if (!(await Roles.userIsInRoleAsync(Meteor.userId(), [RoleEnum.MANAGER]))) {
      throw new Meteor.Error(
        "invalid-permissions",
        "No permissions to edit a shift",
      );
    }

    const shift = await ShiftsCollection.findOneAsync(shiftId);
    if (!shift) {
      throw new Meteor.Error("shift-not-found", "Shift not found");
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

    // Error if there is an overlapping shift with a non-schedule status (excluding current shift)
    const trueOverlaps = await ShiftsCollection.find({
      _id: { $ne: shiftId },
      user: userId,
      start: { $lt: end },
      end: { $gt: start },
      status: { $ne: ShiftStatus.SCHEDULED },
    }).fetchAsync();

    if (trueOverlaps.length > 0) {
      throw new Meteor.Error(
        "shift-overlap-error",
        "Cannot edit shift that overlaps with non-scheduled shifts",
      );
    }

    return await ShiftsCollection.updateAsync(shiftId, {
      $set: {
        user: userId,
        start,
        end,
      },
    });
  }),

  "shifts.delete": requireLoginMethod(async function ({
    shiftId,
  }: {
    shiftId: string;
  }) {
    check(shiftId, String);

    if (!(await Roles.userIsInRoleAsync(Meteor.userId(), [RoleEnum.MANAGER]))) {
      throw new Meteor.Error(
        "invalid-permissions",
        "No permissions to delete a shift",
      );
    }

    const shift = await ShiftsCollection.findOneAsync(shiftId);
    if (!shift) {
      throw new Meteor.Error("shift-not-found", "Shift not found");
    }

    // Only allow deletion of scheduled shifts
    if (shift.status !== ShiftStatus.SCHEDULED) {
      throw new Meteor.Error(
        "invalid-shift-status",
        "Can only delete scheduled shifts",
      );
    }

    return await ShiftsCollection.removeAsync(shiftId);
  }),
});
