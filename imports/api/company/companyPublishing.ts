import { Meteor } from "meteor/meteor";
import { COMPANY_ID, CompanyCollection } from "./CompanyCollection";
import { requireLoginPublish } from "../accounts/wrappers";

Meteor.publish(
  "company",
  requireLoginPublish(function () {
    return CompanyCollection.find(COMPANY_ID);
  }),
);
