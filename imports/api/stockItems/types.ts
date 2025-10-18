import { StockItem, StockLineItem } from "./StockItemsCollection";

export interface AddStockItemInput
  extends Pick<StockItem, "name" | "supplier">,
    Pick<StockLineItem, "quantity" | "location">,
    Partial<Pick<StockLineItem, "expiry">> {}

export type UpdateLineItemInput = Partial<
  Pick<StockLineItem, "quantity" | "location" | "expiry">
>;

export type UpdateStockItemInput = Partial<
  Pick<StockItem, "name" | "supplier">
>;
