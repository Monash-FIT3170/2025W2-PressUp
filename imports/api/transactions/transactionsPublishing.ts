import { Meteor } from "meteor/meteor";
import { TransactionsCollection } from "./TransactionsCollection";

Meteor.publish("transactions", function () {
  return TransactionsCollection.find();
});
