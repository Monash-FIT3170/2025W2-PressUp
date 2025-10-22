import {
  StockItem,
  StockItemsCollection,
  StockLineItem,
} from "./StockItemsCollection";
import { OmitDB, IdType } from "../database";
import { Random } from "meteor/random";
import { AddStockItemInput } from "./types";

export const mergeDuplicates = async (
  name: string,
  supplier: string | null,
  excludeId?: IdType,
): Promise<IdType | null> => {
  const query: any = { name, supplier };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const duplicateItems = await StockItemsCollection.find(query).fetchAsync();

  if (duplicateItems.length > 1) {
    const mainItem = duplicateItems[0];
    const itemsToMerge = duplicateItems.slice(1);

    let allLineItems = [...mainItem.lineItems];

    for (const item of itemsToMerge) {
      allLineItems = [...allLineItems, ...item.lineItems];
      await StockItemsCollection.removeAsync(item._id);
    }

    await StockItemsCollection.updateAsync(mainItem._id, {
      $set: { lineItems: allLineItems },
    });

    return mainItem._id;
  }

  return null;
};

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
