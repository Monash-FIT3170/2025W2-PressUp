import { Meteor } from "meteor/meteor";
import { SuppliersCollection } from "./SuppliersCollection";

Meteor.publish("suppliers", function () {
  return SuppliersCollection.find();
});
