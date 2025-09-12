import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { ShiftsCollection } from "./ShiftsCollection";
import { requireLoginMethod } from "/imports/api/accounts/wrappers";

Meteor.methods({
  "shifts.clockIn": requireLoginMethod(async function () {
    const userId = this.userId!;
    let scheduledEnd: Date | undefined;

    if (scheduledEnd !== undefined) {
      check(scheduledEnd, Date);
    }

    // if user is in active shift then refuse
    const existingActiveShift = await ShiftsCollection.findOneAsync({
      user: userId,
      end: { $exists: false },
    });

    if (existingActiveShift) {
      throw new Meteor.Error(
        "already-clocked-in",
        "You are already clocked in",
      );
    }

    try {
      const shiftId = await ShiftsCollection.insertAsync({
        user: userId,
        start: new Date(),
        end: new Date(Date.now() + 8 * 60 * 60 * 1000),
        ...(scheduledEnd ? { scheduledEnd } : {}),
      });

      console.log(`User ${userId} clocked in at ${new Date()}`);
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

  "shifts.clockOut": requireLoginMethod(async function (shiftId: string) {
    check(shiftId, String);

    const userId = this.userId!;

    const shift = await ShiftsCollection.findOneAsync({
      _id: shiftId,
      user: userId,
      end: { $exists: false },
    });

    if (!shift) {
      throw new Meteor.Error(
        "invalid-shift",
        "Active shift not found or doesn't belong to you",
      );
    }

    try {
      const result = await ShiftsCollection.updateAsync(shiftId, {
        $set: {
          end: new Date(),
        },
      });

      console.log(`User ${userId} clocked out at ${new Date()}`);
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
      end: { $exists: false },
    });
  }),
});
