import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { DeductionsCollection } from "./DeductionsCollection";

Meteor.methods({
  "deductions.add"(deduction: {
    name: string;
    date: Date;
    description?: string;
    amount: number;
  }) {
    check(deduction, {
      name: String,
      date: Date,
      description: String,
      amount: Number,
    });

    if (!this.userId) {
      throw new Meteor.Error("Not authorized");
    }

    return DeductionsCollection.insertAsync({
      name: deduction.name,
      date: deduction.date,
      description: deduction.description || "",
      amount: deduction.amount,
    });
  },
});
