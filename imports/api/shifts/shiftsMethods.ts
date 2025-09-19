import { check, Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { requireLoginMethod } from "../accounts/wrappers";
import { ShiftsCollection, ShiftStatus, ShiftTime } from "./ShiftsCollection";
import { Roles } from "meteor/alanning:roles";
import { RoleEnum } from "../accounts/roles";
import { NumbersToN } from "ts-number-range";

const ShiftTimePattern = Match.Where((v: unknown): v is ShiftTime => {
  const valid =
    typeof v === "object" &&
    v !== null &&
    "hour" in v &&
    "minute" in v &&
    typeof (v as { hour: unknown }).hour === "number" &&
    Number.isInteger((v as { hour: unknown }).hour) &&
    (v as { hour: number }).hour >= 0 &&
    (v as { hour: number }).hour <= 23 &&
    typeof (v as { minute: unknown }).minute === "number" &&
    Number.isInteger((v as { minute: unknown }).minute) &&
    (v as { minute: number }).minute >= 0 &&
    (v as { minute: number }).minute <= 59;

  if (!valid) {
    throw new Meteor.Error("invalid-shift-time", "Invalid hour/minute");
  }
  return true;
});

Meteor.methods({
  "shifts.schedule": requireLoginMethod(async function ({
    userId,
    date,
    start,
    end,
  }: {
    userId: string;
    date: Date;
    start: ShiftTime;
    end: ShiftTime;
  }) {
    check(userId, String);
    check(date, Date);
    check(start, ShiftTimePattern);
    check(end, ShiftTimePattern);

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

    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Meteor.Error("invalid-date", "Date is invalid");
    }

    if (
      end.hour < start.hour ||
      (end.hour === start.hour && end.minute <= start.minute)
    ) {
      throw new Meteor.Error(
        "invalid-time-range",
        "End time must be after start time",
      );
    }

    // Check if user already has a shift on this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingShift = await ShiftsCollection.findOneAsync({
      user: userId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (existingShift) {
      throw new Meteor.Error(
        "shift-already-exists",
        "User already has a shift scheduled for this day",
      );
    }

    return await ShiftsCollection.insertAsync({
      user: userId,
      date,
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

  "shifts.getPayForShift": requireLoginMethod(async function (shiftId: string) {
    check(shiftId, String);

    // Find the shift
    const shift = await ShiftsCollection.findOneAsync(shiftId);
    if (!shift) {
      throw new Meteor.Error("shift-not-found", "Shift not found");
    }

    if (!shift.end) {
      return 0;
    }

    // Find the user linked to the shift
    const user = (await Meteor.users.findOneAsync(
      { _id: shift.user },
      { fields: { payRate: 1 } },
    )) as any;

    const payRate = user?.payRate ?? 0;

    // Calculate shift duration in hours
    const startMinutes = shift.start.hour * 60 + shift.start.minute;
    const endMinutes = shift.end.hour * 60 + shift.end.minute;
    const durationMinutes = endMinutes - startMinutes;

    if (durationMinutes <= 0) {
      throw new Meteor.Error(
        "invalid-shift-duration",
        "Shift duration invalid",
      );
    }

    const durationHours = durationMinutes / 60;

    // Return pay = hours × payRate
    return payRate * durationHours;
  }),

  "shifts.getAll"() {
    if (!this.userId) {
      throw new Meteor.Error("Not authorized");
    }

    return ShiftsCollection.find().fetch();
  },
});
