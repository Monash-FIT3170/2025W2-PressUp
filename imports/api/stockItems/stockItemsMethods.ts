import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { StockItemsCollection } from "..";

Meteor.methods({
  "stockItems.insert"(item: { name: string; quantity: number; location: string; supplier: string }) {
    check(item.name, String);
    check(item.quantity, Number);
    check(item.location, String);
    check(item.supplier, String);

    return StockItemsCollection.insertAsync({...item, supplier: null});
  },
});
