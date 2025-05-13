import { Meteor } from "meteor/meteor";
import { Transaction, TransactionsCollection } from "./TransactionsCollection";
import { Mongo } from "meteor/mongo";

Meteor.methods({
  'transactions.insert'(transaction: Transaction) {
    TransactionsCollection.insertAsync(transaction);
  },

  'transactions.delete'(transactionID: Mongo.ObjectID) {
    if (!transactionID) {
      throw new Meteor.Error('invalid-ID', 'Transaction ID is required');
    }
    TransactionsCollection.removeAsync({ id: transactionID });
  },

  'transactions.update'(transactionID: Mongo.ObjectID, updatedFields: Partial<Transaction>) {
    if (!transactionID || !updatedFields) {
      throw new Meteor.Error('invalid-arguments', 'Transaction ID and updated fields are required');
    }
    TransactionsCollection.updateAsync({ transactionID: Mongo.ObjectID }, {
      $set: updatedFields
    });
  },

  'transactions.getAll'() {
    return TransactionsCollection.find().fetch();
  },

  
});