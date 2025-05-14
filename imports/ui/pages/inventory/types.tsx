import { StockItem, Supplier } from "/imports/api";

export interface StockItemWithSupplier extends Omit<StockItem, 'supplier'> {
  supplier: Supplier | null;
}

