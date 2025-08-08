import { Meteor } from "meteor/meteor";
import { TransactionsCollection } from "./TransactionsCollection";
import { requireLoginPublish } from "../accounts/wrappers";

Meteor.publish("transactions", requireLoginPublish(function () {
  return TransactionsCollection.find();
}));
