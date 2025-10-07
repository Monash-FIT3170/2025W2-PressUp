import React, { useState, useEffect, useCallback, useMemo } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { FinanceCard } from "../../components/FinanceCard";
import { FinanceDateFilter } from "../../components/FinanceDateFilter";
import {
  format,
  startOfToday,
  startOfWeek,
  startOfMonth,
  startOfYear,
  subDays,
} from "date-fns";
import { Meteor } from "meteor/meteor";
import { Order, OrderMenuItem } from "/imports/api/orders/OrdersCollection";
import { PurchaseOrder } from "/imports/api/purchaseOrders/PurchaseOrdersCollection";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Label,
} from "recharts";
import { SearchBar } from "../../components/SearchBar";
import { MenuItem } from "/imports/api/menuItems/MenuItemsCollection";

interface FinancialData {
  revenue: {
    items: { label: string; amount: number; percentage: number }[];
    total: number;
  };
  expenses: {
    items: { label: string; amount: number; percentage: number }[];
    total: number;
  };
  netProfitLoss: {
    items: { label: string; amount: number; percentage?: number }[];
  };
}

interface DetailItemProps {
  label: string;
  amount: number;
  percentage?: number;
}

export const DetailItem = React.memo(
  ({ label, amount, percentage }: DetailItemProps) => {
    const isPositive = amount > 0;
    const sign = amount < 0 ? "-" : "";

    return (
      <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex-1">
          <span className="font-medium text-gray-800">{label}</span>
          {percentage && (
            <span className="ml-2 text-sm text-gray-500">
              ({percentage.toFixed(2)}% of total)
            </span>
          )}
        </div>
        <div
          className={`font-semibold text-lg ${
            isPositive ? "text-green-700" : "text-red-700"
          }`}
        >
          ${sign}
          {Math.abs(amount).toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}
        </div>
      </div>
    );
  },
);
DetailItem.displayName = "DetailItem";

export const ProfitLossPage = () => {
  const [_, setPageTitle] = usePageTitle();
  const [selectedMetric, setSelectedMetric] = useState("netProfitLoss");
  const [searchItem, setSearchItem] = useState("");
  const [financialData, setFinancialData] = useState<FinancialData | null>(
    null,
  );
  const [dateRange, setDateRange] = React.useState<
    | "all"
    | "today"
    | "thisWeek"
    | "thisMonth"
    | "thisYear"
    | "past7Days"
    | "past30Days"
  >("all");

  const getDateRangeText = (range: typeof dateRange): string => {
    const today = startOfToday();
    const end = today; // assume end is always today unless "all"
    let start: Date;
    switch (range) {
      case "today":
        start = today;
        break;
      case "thisWeek":
        start = startOfWeek(today, { weekStartsOn: 1 }); // Monday
        break;
      case "thisMonth":
        start = startOfMonth(today);
        break;
      case "thisYear":
        start = startOfYear(today);
        break;
      case "past7Days":
        start = subDays(today, 6); // 6 days ago + today = 7
        break;
      case "past30Days":
        start = subDays(today, 29);
        break;
      case "all":
      default:
        return "All Time";
    }
    return `${format(start, "dd/MM/yy")} – ${format(end, "dd/MM/yy")}`;
  };

  const getDateRangeFilter = (range: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (range) {
      case "today":
        return (date: Date) => date >= today;
      case "thisWeek":
        return (date: Date) => date >= startOfWeek(today, { weekStartsOn: 1 });
      case "thisMonth":
        return (date: Date) => date >= startOfMonth(today);
      case "thisYear":
        return (date: Date) => date >= startOfYear(today);
      case "past7Days":
        return (date: Date) => date >= subDays(today, 6);
      case "past30Days":
        return (date: Date) => date >= subDays(today, 29);
      case "all":
      default:
        return () => true;
    }
  };

  const processOrderData = useCallback(
    (
      orders: Order[],
      categoryMap: Record<string, string[]>,
    ): {
      revenue: number;
      revenueItems: { label: string; amount: number; percentage: number }[];
    } => {
      const revenueByCat: Record<string, number> = {};
      let totalRevenue = 0;

      orders.forEach((order) => {
        if (!order.paid) return;

        let orderRevenue = 0;

        order.menuItems.forEach((menuItem: OrderMenuItem) => {
          const itemRevenue = (menuItem.price ?? 0) * (menuItem.quantity ?? 1);
          orderRevenue += itemRevenue;

          const key = String((menuItem as any).menuItemId ?? "");
          const categories =
            categoryMap[key] && categoryMap[key].length > 0
              ? categoryMap[key]
              : ["uncategorized"];

          categories.forEach((cat) => {
            revenueByCat[cat] = (revenueByCat[cat] || 0) + itemRevenue;
          });
        });

        totalRevenue += orderRevenue;
      });

      const revenueItems = Object.keys(revenueByCat).map((category) => ({
        label: category,
        amount: revenueByCat[category],
        percentage: totalRevenue
          ? (revenueByCat[category] / totalRevenue) * 100
          : 0,
      }));

      return { revenue: totalRevenue, revenueItems };
    },
    [],
  );

  const processPurchaseOrderData = useCallback(
    async (
      purchaseOrders: PurchaseOrder[],
    ): Promise<{
      expenses: number;
      expenseItems: { label: string; amount: number; percentage: number }[];
    }> => {
      const expensesBySupplier: { [key: string]: number } = {};
      let totalExpenses = 0;

      // Get supplier names for all purchase orders
      for (const purchaseOrder of purchaseOrders) {
        const orderCost = purchaseOrder.totalCost;
        totalExpenses += orderCost;

        let supplierKey = "Unknown Supplier";
        if (purchaseOrder.supplier) {
          try {
            supplierKey = await Meteor.callAsync(
              "suppliers.getNameById",
              purchaseOrder.supplier.toString(),
            );
          } catch (error) {
            console.warn(
              `Failed to get supplier name for ID ${purchaseOrder.supplier}:`,
              error,
            );
            supplierKey = "Unknown Supplier";
          }
        }

        expensesBySupplier[supplierKey] =
          (expensesBySupplier[supplierKey] || 0) + orderCost;
      }

      const expenseItems = Object.keys(expensesBySupplier).map((supplier) => ({
        label: supplier,
        amount: expensesBySupplier[supplier],
        percentage: (expensesBySupplier[supplier] / totalExpenses) * 100,
      }));

      return { expenses: totalExpenses, expenseItems };
    },
    [],
  );

  const processFinancialData = useCallback(
    async (
      orders: Order[],
      purchaseOrders: PurchaseOrder[],
      categoryMap: Record<string, string[]>,
    ): Promise<FinancialData> => {
      const { revenue: totalRevenue, revenueItems } = processOrderData(
        orders,
        categoryMap,
      );
      const { expenses: totalExpenses, expenseItems } =
        await processPurchaseOrderData(purchaseOrders);

      const netProfit = totalRevenue - totalExpenses;

      return {
        revenue: { items: revenueItems, total: totalRevenue },
        expenses: { items: expenseItems, total: totalExpenses },
        netProfitLoss: {
          items: [
            { label: "Total Revenue", amount: totalRevenue },
            { label: "Total Expenses", amount: -totalExpenses },
            { label: "Net Profit/Loss", amount: netProfit },
          ],
        },
      };
    },
    [processOrderData, processPurchaseOrderData],
  );

  useEffect(() => {
    setPageTitle("Finance - Profit Loss");

    const fetchOrders = async () => {
      try {
        const dateFilter = getDateRangeFilter(dateRange);

        const [orderData, purchaseOrderData, menuItems] = await Promise.all([
          Meteor.callAsync("orders.getAll") as Promise<Order[]>,
          Meteor.callAsync("purchaseOrders.getAll") as Promise<PurchaseOrder[]>,
          Meteor.callAsync("menuItems.getAll") as Promise<MenuItem[]>,
        ]);

        // Build menuItemId -> categories map
        const categoryMap: Record<string, string[]> = {};
        menuItems.forEach((mi) => {
          if (mi?._id) categoryMap[String(mi._id)] = mi.category ?? [];
        });

        // Filter by date
        const filteredOrderData = orderData.filter((order) =>
          dateFilter(new Date(order.createdAt)),
        );
        const filteredPurchaseOrderData = purchaseOrderData.filter((po) =>
          dateFilter(new Date(po.date)),
        );

        const processedData = await processFinancialData(
          filteredOrderData,
          filteredPurchaseOrderData,
          categoryMap,
        );
        setFinancialData(processedData);
      } catch (error) {
        console.error("Error fetching order data", error);
      }
    };

    fetchOrders();
  }, [setPageTitle, dateRange, processFinancialData]);

  const mainMetrics = useMemo(() => {
    if (!financialData) return [];

    return [
      {
        key: "revenue",
        title: "Revenue",
        description: "Detailed breakdown of revenue by category.",
        chartDescription: "Chart of revenue by category",
        searchPlaceholder: "Search categories...",
        amount: financialData.revenue.total,
        items: financialData.revenue.items,
      },
      {
        key: "expenses",
        title: "Expenses",
        description: "Detailed breakdown of expenses from purchase orders.",
        chartDescription: "Chart of expenses from purchase orders",
        searchPlaceholder: "Search suppliers...",
        amount: financialData.expenses.total,
        items: financialData.expenses.items,
      },
      {
        key: "netProfitLoss",
        title: "Net Profit/Loss",
        description: "Summary of financial performance.",
        chartDescription: "Chart summary of financial performance",
        searchPlaceholder: "Search items...",
        amount:
          financialData.netProfitLoss.items.find(
            (i) => i.label === "Net Profit/Loss",
          )?.amount ?? 0,
        items: financialData.netProfitLoss.items,
      },
    ];
  }, [financialData]);

  const selectedData = useMemo(
    () => mainMetrics.find((m) => m.key === selectedMetric),
    [mainMetrics, selectedMetric],
  );

  if (!selectedMetric) {
    return (
      <div className="w-full p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        Data not found.
      </div>
    );
  }

  if (!financialData) {
    return (
      <div className="w-full p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const filteredItems = (selectedData?.items || [])
    .filter((item) =>
      item.label.toLowerCase().includes(searchItem.toLowerCase()),
    )
    .slice()
    .sort((a, b) => b.amount - a.amount);

  const chartTitle = selectedData?.title + " Chart";
  const chartDescription = selectedData?.chartDescription;
  const chartData = filteredItems;

  return (
    <div className="w-full p-6 bg-gray-50 max-h-screen overflow-y-auto">
      {/* Date Filter and Period Display */}
      <div className="flex items-baseline gap-4 mb-4">
        <FinanceDateFilter range={dateRange} onRangeChange={setDateRange} />
        <h2 className="ml-4 text-red-900">
          <span className="font-bold">Viewing Period:</span>{" "}
          <span className="font-normal">{getDateRangeText(dateRange)}</span>
        </h2>
      </div>

      {/* Finance Cards (adds one for each metric) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {mainMetrics.map((metric) => (
          <FinanceCard
            key={metric.key}
            title={metric.title}
            amount={metric.amount}
            isSelected={selectedMetric === metric.key}
            onClick={() => setSelectedMetric(metric.key)}
          />
        ))}
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <SearchBar onSearch={setSearchItem} initialSearchTerm={searchItem} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {chartTitle}
            </h2>
            <p className="text-gray-600">{chartDescription}</p>
          </div>
          <div className="space-y-3">
            <div className="h-80 w-full">
              <ResponsiveContainer>
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <YAxis dataKey="label" type="category" width={150}>
                    {/* <Label value="Date" offset={-5} position="insideBottom" /> */}
                  </YAxis>
                  <XAxis type="number">
                    <Label
                      value="Amount ($)"
                      position="insideBottom"
                      offset={-5}
                      style={{ textAnchor: "middle" }}
                    />
                  </XAxis>
                  <Tooltip />

                  <Bar
                    dataKey="amount"
                    fill="#6f597b"
                    name="Amount"
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detail Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {selectedData?.title + " Breakdown"}
            </h2>
            <p className="text-gray-600">{selectedData?.description}</p>
          </div>

          <div className="space-y-3">
            {filteredItems?.map((item, index) => (
              <DetailItem
                key={index}
                label={item.label}
                amount={item.amount}
                percentage={item.percentage}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
