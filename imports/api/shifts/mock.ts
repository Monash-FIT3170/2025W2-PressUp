import { faker } from "@faker-js/faker";
import { ShiftsCollection, ShiftTime } from "./ShiftsCollection";

export const mockShifts = async (count: number = 15) => {
  if ((await ShiftsCollection.countDocuments()) > 0) {
    await ShiftsCollection.dropCollectionAsync();
  }

  const generateShiftTime = (hour: number, minute: number = 0): ShiftTime => ({
    hour: Math.min(23, Math.max(0, hour)) as ShiftTime["hour"],
    minute: Math.min(59, Math.max(0, minute)) as ShiftTime["minute"],
  });

  const shiftPatterns = [
    { start: { hour: 6, minute: 0 }, end: { hour: 14, minute: 0 } }, // Morning shift
    { start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } }, // Day shift
    { start: { hour: 14, minute: 0 }, end: { hour: 22, minute: 0 } }, // Evening shift
  ];

  for (let i = 0; i < count; i++) {
    const pattern = faker.helpers.arrayElement(shiftPatterns);
    const shiftDate = faker.date.between({
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });

    await ShiftsCollection.insertAsync({
      user: faker.person.firstName() + " " + faker.person.lastName(),
      date: shiftDate,
      start: generateShiftTime(pattern.start.hour, pattern.start.minute),
      end: generateShiftTime(pattern.end.hour, pattern.end.minute),
    });
  }
};
