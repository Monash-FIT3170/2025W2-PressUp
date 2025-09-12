import { mockMenuItems } from "../menuItems/mock";
import { mockStockItems } from "../stockItems/mock";
import { mockSuppliers } from "../suppliers/mock";
import { mockPurchaseOrders } from "../purchaseOrders/mock";
import { mockTables } from "../tables/mock";
import { mockOrders } from "../orders/mock";

export const mockDataGenerator = async ({
  supplierCount,
  orderCount,
  purchaseOrderCount,
  tableCount,
}: {
  supplierCount?: number;
  orderCount?: number;
  purchaseOrderCount?: number;
  tableCount?: number;
}) => {
  supplierCount = supplierCount || 10;
  orderCount = orderCount || 5;
  purchaseOrderCount = purchaseOrderCount || 10;
  tableCount = tableCount || 10;

  await mockSuppliers(supplierCount);
  await mockMenuItems();
  await mockStockItems();
  await mockPurchaseOrders(purchaseOrderCount);
  await mockTables(tableCount);
  await mockOrders(orderCount);
};
