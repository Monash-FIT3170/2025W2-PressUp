import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Deduction, DeductionsCollection } from "./DeductionsCollection";
import { OmitDB } from "../database";
import { requireLoginMethod } from "../accounts/wrappers";

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

  "deductions.update": requireLoginMethod(async function (
    itemName: string,
    updatedFields: Partial<OmitDB<Deduction>>,
  ) {
    check(itemName, String);
    check(updatedFields, Object);

    if (!itemName || !updatedFields) {
      throw new Meteor.Error(
        "invalid-arguments",
        "Item name and updated fields are required",
      );
    }

    // Validate updated fields
    if (updatedFields.amount !== undefined && updatedFields.amount < 0) {
      throw new Meteor.Error("invalid-price", "Price cannot be negative");
    }

    const result = await DeductionsCollection.updateAsync(
      { name: itemName },
      { $set: updatedFields },
    );

    if (result === 0) {
      throw new Meteor.Error("not-found", "Item not found");
    }

    return result;
  }),
});
