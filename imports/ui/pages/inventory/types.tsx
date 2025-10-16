import { StockItem, Supplier } from "/imports/api";

export type { StockItem };

export interface StockItemWithSupplier extends Omit<StockItem, "supplier"> {
  supplier: Supplier | null;
}

export interface AggregatedStockItem {
  name: string;
  totalQuantity: number;
  locations: string[];
  suppliers: (Supplier | null)[];
  itemCount: number;
}
