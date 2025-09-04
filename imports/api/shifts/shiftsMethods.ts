import { check, Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { requireLoginMethod } from "../accounts/wrappers";
import { ShiftsCollection, ShiftTime } from "./ShiftsCollection";
import { Roles } from "meteor/alanning:roles";
import { RoleEnum } from "../accounts/roles";

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
  "shifts.new": requireLoginMethod(async function ({
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
    });
  }),
});
