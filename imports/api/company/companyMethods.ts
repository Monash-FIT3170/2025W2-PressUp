import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import { Company, CompanyCollection, COMPANY_ID } from "./CompanyCollection";
import { requireLoginMethod } from "../accounts/wrappers";
import { RoleEnum } from "../accounts/roles";
import { OmitDB } from "../database";

Meteor.methods({
  "company.update": requireLoginMethod(async function (
    companyData: OmitDB<Company>,
  ) {
    check(companyData, {
      name: String,
      address: String,
      phone: Match.Optional(String),
      email: Match.Optional(String),
      website: Match.Optional(String),
    });

    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.ADMIN]))) {
      throw new Meteor.Error(
        "unauthorized",
        "Only admins can update company settings",
      );
    }

    const existingCompany = await CompanyCollection.findOneAsync(COMPANY_ID);

    if (existingCompany) {
      const result = await CompanyCollection.updateAsync(COMPANY_ID, {
        $set: companyData,
      });
      return result;
    } else {
      const result = await CompanyCollection.insertAsync({
        ...companyData,
        _id: COMPANY_ID,
      });
      return result;
    }
  }),
});
