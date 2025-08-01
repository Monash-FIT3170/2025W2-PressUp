import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { SuppliersCollection } from "..";
import { requireLoginMethod } from "../accounts/wrappers";

Meteor.methods({
  "suppliers.insert": requireLoginMethod(async function (supplier: { name: string;   description: string;
  pastOrderQty: number; phone: string; email?: string; website?: string; address?: string; goods: string[];}) {
    check(supplier.name, String);
    //check(supplier.description, String);
    //check(supplier.pastOrderQty, Number);
    check(supplier.phone, String);
    check(supplier.email, String);
    check(supplier.website, String);
    check(supplier.address, String);
    check(supplier.goods, Array);


    return await SuppliersCollection.insertAsync(supplier);
  }),
});
