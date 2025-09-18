import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import {
  ShiftsCollection,
  ShiftStatus,
  shiftTimeUtils,
} from "./ShiftsCollection";
import { requireLoginMethod } from "/imports/api/accounts/wrappers";

Meteor.methods({
  "shifts.clockIn": requireLoginMethod(async function () {
    const userId = this.userId!;
    const now = new Date();
    const currentTime = shiftTimeUtils.now();

    const existingActiveShift = await ShiftsCollection.findOneAsync({
      user: userId,
      status: ShiftStatus.CLOCKED_IN,
    });

    if (existingActiveShift) {
      throw new Meteor.Error(
        "already-clocked-in",
        "You are already clocked in",
      );
    }

    try {
      const scheduledShifts = await ShiftsCollection.find({
        user: userId,
        status: ShiftStatus.SCHEDULED,
        date: {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        },
      }).fetchAsync();

      const overlappingShift = scheduledShifts.find((shift) =>
        shiftTimeUtils.isCurrentTimeInShift(shift),
      );

      let shiftId: string;

      if (overlappingShift) {
        await ShiftsCollection.updateAsync(overlappingShift._id, {
          $set: {
            status: ShiftStatus.CLOCKED_IN,
            start: currentTime,
          },
          $unset: {
            end: "",
          },
        });
        shiftId = overlappingShift._id;
        console.log(
          `User ${userId} clocked into scheduled shift at ${shiftTimeUtils.format(currentTime)}`,
        );
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        shiftId = await ShiftsCollection.insertAsync({
          user: userId,
          date: today,
          start: currentTime,
          status: ShiftStatus.CLOCKED_IN,
        });
        console.log(
          `User ${userId} created new shift and clocked in at ${shiftTimeUtils.format(currentTime)}`,
        );
      }

      return shiftId;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Meteor.Error(
        "clock-in-failed",
        "Failed to clock in: " + errorMessage,
      );
    }
  }),

  "shifts.clockOut": requireLoginMethod(async function () {
    const userId = this.userId!;
    const currentTime = shiftTimeUtils.now();

    const activeShift = await ShiftsCollection.findOneAsync({
      user: userId,
      status: ShiftStatus.CLOCKED_IN,
    });

    if (!activeShift) {
      throw new Meteor.Error(
        "no-active-shift",
        "No active shift found to clock out of",
      );
    }

    try {
      const result = await ShiftsCollection.updateAsync(activeShift._id, {
        $set: {
          status: ShiftStatus.COMPLETED,
          end: currentTime,
        },
      });

      console.log(
        `User ${userId} clocked out at ${shiftTimeUtils.format(currentTime)}`,
      );
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Meteor.Error(
        "clock-out-failed",
        "Failed to clock out: " + errorMessage,
      );
    }
  }),

  "shifts.getCurrentShift": requireLoginMethod(async function () {
    const userId = this.userId!;

    return await ShiftsCollection.findOneAsync({
      user: userId,
      status: ShiftStatus.CLOCKED_IN,
    });
  }),

  "shifts.createScheduled": requireLoginMethod(async function (
    date: Date,
    start: { hour: number; minute: number },
    scheduledEnd: { hour: number; minute: number },
    assignedUserId?: string,
  ) {
    check(date, Date);
    check(start, { hour: Number, minute: Number });
    check(scheduledEnd, { hour: Number, minute: Number });

    const userId = assignedUserId || this.userId!;

    if (
      start.hour < 0 ||
      start.hour >= 24 ||
      start.minute < 0 ||
      start.minute >= 60
    ) {
      throw new Meteor.Error("invalid-time", "Invalid start time");
    }
    if (
      scheduledEnd.hour < 0 ||
      scheduledEnd.hour >= 24 ||
      scheduledEnd.minute < 0 ||
      scheduledEnd.minute >= 60
    ) {
      throw new Meteor.Error("invalid-time", "Invalid end time");
    }

    try {
      const shiftId = await ShiftsCollection.insertAsync({
        user: userId,
        date: date,
        start: start as any,
        end: scheduledEnd as any,
        scheduledEnd: scheduledEnd as any,
        status: ShiftStatus.SCHEDULED,
      });

      console.log(
        `Scheduled shift created for user ${userId} on ${date.toDateString()}`,
      );
      return shiftId;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Meteor.Error(
        "create-scheduled-shift-failed",
        "Failed to create scheduled shift: " + errorMessage,
      );
    }
  }),
});
