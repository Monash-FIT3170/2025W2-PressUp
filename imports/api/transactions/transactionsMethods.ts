import { Meteor } from "meteor/meteor";
import { Transaction, TransactionsCollection } from "./TransactionsCollection";
import { Mongo } from "meteor/mongo";
import { requireLoginMethod } from "../accounts/wrappers";

Meteor.methods({
  'transactions.insert': requireLoginMethod(async function (transaction: Transaction) {
    await TransactionsCollection.insertAsync(transaction);
  }),

  'transactions.delete': requireLoginMethod(async function (transactionID: Mongo.ObjectID) {
    if (!transactionID) {
      throw new Meteor.Error('invalid-ID', 'Transaction ID is required');
    }
    await TransactionsCollection.removeAsync({ id: transactionID });
  }),

  'transactions.update': requireLoginMethod(async function (transactionID: Mongo.ObjectID, updatedFields: Partial<Transaction>) {
    if (!transactionID || !updatedFields) {
      throw new Meteor.Error('invalid-arguments', 'Transaction ID and updated fields are required');
    }
    await TransactionsCollection.updateAsync({ transactionID: Mongo.ObjectID }, {
      $set: updatedFields
    });
  }),

  'transactions.getAll': requireLoginMethod(async function () {
    return TransactionsCollection.find().fetch();
  }),
});
