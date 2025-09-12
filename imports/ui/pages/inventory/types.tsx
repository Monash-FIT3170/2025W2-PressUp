import { StockItem, Supplier } from "/imports/api";

export type { StockItem };

export interface StockItemWithSupplier extends Omit<StockItem, "supplier"> {
  supplier: Supplier | null;
}
