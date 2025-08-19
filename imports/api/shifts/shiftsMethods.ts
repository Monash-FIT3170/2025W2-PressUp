import { check, Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { requireLoginMethod } from "../accounts/wrappers";
import { ShiftsCollection, ShiftTime } from "./ShiftsCollection";

const ShiftTimePattern = Match.Where((v: any) => {
  const matches =
    v &&
    typeof v === "object" &&
    Number.isInteger(v.hour) &&
    v.hour >= 0 &&
    v.hour <= 23 &&
    Number.isInteger(v.minute) &&
    v.minute >= 0 &&
    v.minute <= 59;
  if (!matches)
    throw new Meteor.Error("invalid-shift-time", "Invalid hour/minute");
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

    return await ShiftsCollection.insertAsync({
      user: userId,
      date,
      start,
      end,
    });
  }),
});
