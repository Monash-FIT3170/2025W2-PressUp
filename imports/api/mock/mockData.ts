import { mockMenuItems } from "../menuItems/mock";
import { mockStockItems } from "../stockItems/mock";
import { mockSuppliers } from "../suppliers/mock";
import { mockPurchaseOrders } from "../purchaseOrders/mock";
import { mockTables } from "../tables/mock";
import { mockOrders } from "../orders/mock";
import { mockPosts, mockComments } from "../posts/mock";
import { mockShifts } from "../shifts/mock";
import { mockDeductions } from "../tax/mock";
import { mockAccounts } from "../accounts/mock";

export const mockDataGenerator = async ({
  supplierCount,
  orderCount,
  purchaseOrderCount,
  tableCount,
  postCount,
  commentCount,
  deductionCount,
  accountCount,
}: {
  supplierCount?: number;
  orderCount?: number;
  purchaseOrderCount?: number;
  tableCount?: number;
  postCount?: number;
  commentCount?: number;
  deductionCount?: number;
  accountCount?: number;
}) => {
  supplierCount = supplierCount || 10;
  orderCount = orderCount || 5;
  purchaseOrderCount = purchaseOrderCount || 10;
  tableCount = tableCount || 10;
  postCount = postCount || 5;
  commentCount = commentCount || 10;
  deductionCount = deductionCount || 8;
  accountCount = accountCount || 8;

  await mockAccounts(accountCount);

  await mockSuppliers(supplierCount);
  await mockMenuItems();
  await mockDeductions(deductionCount);
  await mockShifts();
  await mockPosts(postCount);

  await mockStockItems();
  await mockPurchaseOrders(purchaseOrderCount);
  await mockTables(tableCount);
  await mockOrders(orderCount);
  await mockComments(commentCount);
};
