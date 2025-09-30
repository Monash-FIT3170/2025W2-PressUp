import { faker } from "@faker-js/faker";
import { Meteor } from "meteor/meteor";
import { ShiftsCollection, ShiftStatus } from "./ShiftsCollection";
import { getDayOfWeek, DayOfWeek } from "../../helpers/date";

export const mockShifts = async () => {
  if ((await ShiftsCollection.countDocuments()) > 0) {
    await ShiftsCollection.dropCollectionAsync();
  }

  const users = await Meteor.users
    .find({}, { fields: { _id: 1 } })
    .fetchAsync();
  if (users.length === 0) return;

  // Add shifts over a 3 week span centered on this week
  const today = new Date();
  const weeks = [
    getDayOfWeek(
      new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      DayOfWeek.MONDAY,
    ),
    getDayOfWeek(today, DayOfWeek.MONDAY),
    getDayOfWeek(
      new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
      DayOfWeek.MONDAY,
    ),
  ];

  const patterns = [
    { startHour: 6, endHour: 14 },
    { startHour: 8, endHour: 16 },
    { startHour: 12, endHour: 20 },
    { startHour: 16, endHour: 22 },
    { startHour: 18, endHour: 24 },
  ];

  for (const weekStart of weeks) {
    for (const user of users) {
      const userShifts: { start: Date; end: Date }[] = [];

      for (let i = 0; i < faker.number.int({ min: 2, max: 4 }); i++) {
        let attempts = 0,
          start = new Date(),
          end = new Date();

        // Find non-overlapping shifts
        while (attempts < 20) {
          attempts++;
          const shiftDate = new Date(weekStart);
          shiftDate.setDate(
            weekStart.getDate() + faker.number.int({ min: 0, max: 6 }),
          );
          const pattern = faker.helpers.arrayElement(patterns);

          start = new Date(shiftDate);
          start.setHours(
            pattern.startHour,
            faker.number.int({ min: -30, max: 30 }),
            0,
            0,
          );
          end = new Date(shiftDate);
          end.setHours(
            pattern.endHour,
            faker.number.int({ min: -30, max: 30 }),
            0,
            0,
          );
          if (end <= start) end.setDate(end.getDate() + 1);

          if (!userShifts.some((s) => start < s.end && end > s.start)) break;
        }

        if (attempts >= 20) continue;
        userShifts.push({ start, end });

        await ShiftsCollection.insertAsync({
          user: user._id,
          start,
          end,
          status:
            end < new Date() ? ShiftStatus.CLOCKED_OUT : ShiftStatus.SCHEDULED,
        });
      }
    }
  }
};
