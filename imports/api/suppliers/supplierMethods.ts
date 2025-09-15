import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Supplier, SuppliersCollection } from "..";
import { requireLoginMethod } from "../accounts/wrappers";
import { OmitDB } from "../database";

Meteor.methods({
  "suppliers.insert": requireLoginMethod(async function (
    supplier: OmitDB<Supplier>,
  ) {
    check(supplier.name, String);
    check(supplier.phone, String);
    check(supplier.email, String);
    check(supplier.website, String);
    check(supplier.address, String);

    return await SuppliersCollection.insertAsync(supplier);
  }),

  "suppliers.getNameById": async function (supplierId: string) {
    check(supplierId, String);

    const supplier = await SuppliersCollection.findOneAsync(supplierId);
    return supplier?.name || "Unknown Supplier";
  },
});
