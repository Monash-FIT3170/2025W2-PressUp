import { StockItem, StockLineItem, Supplier } from "/imports/api";
export type { StockItem, StockLineItem };

export interface StockItemWithSupplier extends Omit<StockItem, "supplier"> {
  supplier: Supplier | null;
}

export interface LineItemWithDetails extends StockLineItem {
  stockItemId: string;
  stockItemName: string;
  supplier: Supplier | null;
}

export interface AggregatedStockItem {
  name: string;
  supplier: Supplier | null;
  stockItemId: string;
  totalQuantity: number;
  itemCount: number;
}

export enum LineItemFilter {
  ALL = "all",
  UNDISPOSED = "undisposed",
  NOT_EXPIRED = "notExpired",
  EXPIRED = "expired",
  DISPOSED = "disposed",
}

export enum StockFilter {
  ALL = "all",
  IN_STOCK = "inStock",
  LOW_IN_STOCK = "lowInStock",
  OUT_OF_STOCK = "outOfStock",
}
