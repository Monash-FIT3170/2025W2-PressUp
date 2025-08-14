import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { requireLoginMethod } from "../accounts/wrappers";
import { ShiftsCollection } from "./ShiftsCollection";

Meteor.methods({
  "shifts.new": requireLoginMethod(async function ({
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

    // User validation
    const userExists = !!(await Meteor.users.findOneAsync(
      { _id: userId },
      { fields: { _id: 1 } },
    ));
    if (!userExists) {
      throw new Meteor.Error("invalid-user", "No user found with the given ID");
    }

    // Date validation
    if (!(start instanceof Date) || isNaN(start.getTime())) {
      throw new Meteor.Error("invalid-start-date", "Start date is invalid");
    }
    if (!(end instanceof Date) || isNaN(end.getTime())) {
      throw new Meteor.Error("invalid-end-date", "End date is invalid");
    }
    if (end <= start) {
      throw new Meteor.Error(
        "invalid-date-range",
        "End date must be after start date",
      );
    }

    return await ShiftsCollection.insertAsync({ user: userId, start, end });
  }),
});
