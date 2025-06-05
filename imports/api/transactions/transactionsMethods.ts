import { Meteor } from "meteor/meteor";
import { Transaction, TransactionsCollection } from "./TransactionsCollection";
import { Mongo } from "meteor/mongo";
import { Order, OrdersCollection } from "../orders/OrdersCollection";

Meteor.methods({
  'transactions.insert'(orderId : string) {
    console.log(orderId)
    if (!orderId) {
      throw new Meteor.Error('invalid-ID', 'Order ID is required');
    }
    const order : Order = OrdersCollection.find({_id: orderId,}).fetch()[0];
    console.log(order)
    TransactionsCollection.insertAsync({
        order: order,
        // discount: order.discountAmount,
        paidAt: new Date(),
      });
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