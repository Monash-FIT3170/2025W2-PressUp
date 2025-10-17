import {
  StockItem,
  StockItemsCollection,
  StockLineItem,
} from "./StockItemsCollection";
import { OmitDB } from "../database";
import { Random } from "meteor/random";
import { AddStockItemInput } from "./types";

export const insertStockItem = async (input: AddStockItemInput) => {
  const existingItem = await StockItemsCollection.findOneAsync({
    name: input.name,
    supplier: input.supplier,
  });

  const newLineItem: StockLineItem = {
    id: Random.id(),
    quantity: input.quantity,
    location: input.location,
    expiry: input.expiry || null,
    disposed: false,
  };

  if (existingItem) {
    return await StockItemsCollection.updateAsync(existingItem._id, {
      $push: { lineItems: newLineItem },
    });
  } else {
    const newStockItem: OmitDB<StockItem> = {
      name: input.name,
      supplier: input.supplier,
      lineItems: [newLineItem],
    };
    return await StockItemsCollection.insertAsync(newStockItem);
  }
};
