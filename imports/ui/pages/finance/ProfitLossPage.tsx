import React, { useState, useEffect, useCallback } from "react";
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
import { Meteor } from 'meteor/meteor'
import { Order } from "../../api/orders/orders";
import { PurchaseOrder } from "../../api/purchaseOrders/PurchaseOrdersCollection";
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

const DetailItem = ({ label, amount, percentage }: DetailItemProps) => {
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
        {Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </div>
    </div>
  );
};

export const ProfitLossPage = () => {
  const [_, setPageTitle] = usePageTitle();
  const [selectedMetric, setSelectedMetric] = useState("netProfitLoss");
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

  // Filters data by date range
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

  // Calculates revenue
  const processOrderData = (
    orders: Order[],
  ): {
    revenue: number;
    revenueItems: { label: string; amount: number; percentage: number }[];
  } => {
    const revenueByCat: { [key: string]: number } = {};

    let totalRevenue = 0;

    orders.forEach((order) => {
      if (!order.paid) return;

      let orderRevenue = 0;

      order.menuItems.forEach((menuItem) => {
        const itemRevenue = menuItem.price * menuItem.quantity;

        orderRevenue += itemRevenue; // prevents double counting

        const categories =
          menuItem.category && menuItem.category.length > 0
            ? menuItem.category
            : ["uncategorized"];

        categories.forEach((category) => {
          revenueByCat[category] = (revenueByCat[category] || 0) + itemRevenue;
        });
      });
      totalRevenue += orderRevenue;
    });

    const revenueItems = Object.keys(revenueByCat).map((category) => ({
      label: category,
      amount: revenueByCat[category],
      percentage: (revenueByCat[category] / totalRevenue) * 100,
    }));

    return { revenue: totalRevenue, revenueItems };
  };

  // Calculates expenses
  const processPurchaseOrderData = (
    purchaseOrders: PurchaseOrder[],
  ): {
    expenses: number;
    expenseItems: { label: string; amount: number; percentage: number }[];
  } => {
    const expensesBySupplier: { [key: string]: number } = {};
    let totalExpenses = 0;

    purchaseOrders.forEach((purchaseOrder) => {
      const orderCost = purchaseOrder.totalCost;
      totalExpenses += orderCost;

      const supplierKey =
        purchaseOrder.supplier?.toString() || "Unknown Supplier"; // replace toString with .name when ids and names correctly match in database
      expensesBySupplier[supplierKey] =
        (expensesBySupplier[supplierKey] || 0) + orderCost;
    });

    const expenseItems = Object.keys(expensesBySupplier).map((supplier) => ({
      label: supplier,
      amount: expensesBySupplier[supplier],
      percentage: (expensesBySupplier[supplier] / totalExpenses) * 100,
    }));

    return { expenses: totalExpenses, expenseItems };
  };

  const processFinancialData = useCallback(
    (orders: Order[], purchaseOrders: PurchaseOrder[]): FinancialData => {
      const { revenue: totalRevenue, revenueItems } = processOrderData(orders);
      const { expenses: totalExpenses, expenseItems } =
        processPurchaseOrderData(purchaseOrders);

      const netProfit = totalRevenue - totalExpenses;

      return {
        revenue: {
          items: revenueItems,
          total: totalRevenue,
        },
        expenses: {
          items: expenseItems,
          total: totalExpenses,
        },
        netProfitLoss: {
          items: [
            { label: "Total Revenue", amount: totalRevenue },
            { label: "Total Expenses", amount: -totalExpenses },
            { label: "Net Profit/Loss", amount: netProfit },
          ],
        },
      };
    },
    [processOrderData, processPurchaseOrderData]
  );

  useEffect(() => {
    setPageTitle("Finance - Profit Loss Page");

    const fetchOrders = async () => {
      try {
        const dateFilter = getDateRangeFilter(dateRange);

        const orderData = (await Meteor.callAsync("orders.getAll")) as Order[];
        const purchaseOrderData = (await Meteor.callAsync(
          "purchaseOrders.getAll",
        )) as PurchaseOrder[];

        // Filter the data based on date range
        const filteredOrderData = orderData.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return dateFilter(orderDate);
        });

        const filteredPurchaseOrderData = purchaseOrderData.filter((po) => {
          const poDate = new Date(po.date);
          return dateFilter(poDate);
        });

        // Uses filetered data to process
        const processedData = processFinancialData(
          filteredOrderData,
          filteredPurchaseOrderData,
        );
        setFinancialData(processedData);
      } catch (error) {
        console.error("Error fetching order data", error);
      }
    };
    fetchOrders();
  }, [setPageTitle, dateRange, processFinancialData]);

  if (!financialData) {
      return <div className="w-full p-6 bg-gray-50 min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const mainMetrics = [
    { 
      key: 'revenue', 
      title: "Revenue",
      description: "Detailed breakdown of revenue by category.",
      chartDescription: 'Chart of revenue by category',
      amount: financialData.revenue.total,
      items: financialData.revenue.items
    },
    { 
      key: 'expenses', 
      title: "Expenses",
      description: "Detailed breakdown of expenses from purchase orders.",
      chartDescription: 'Chart of expenses from purchase orders',
      amount: financialData.expenses.total,
      items: financialData.expenses.items
    },
    { 
      key: 'netProfitLoss', 
      title: "Net Profit/Loss",
      description: "Summary of financial performance.",
      chartDescription: 'Chart summary of financial performance',
      amount: financialData.netProfitLoss.items.find(i => i.label === 'Net Profit/Loss')?.amount ?? 0,
      items: financialData.netProfitLoss.items
    },
  ];

  const selectedData = mainMetrics.find((m) => m.key === selectedMetric);

  let chartTitle = selectedData.title;
  let chartDescription = selectedData.chartDescription;

  if (!selectedMetric) {
    return (<div className="w-full p-6 bg-gray-50 min-h-screen flex items-center justify-center">
      Data not found.
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
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
        
      {/* Graph */}
      <div className="bg-white md:w-3/5 rounded-xl shadow-lg p-6">
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{chartTitle}</h2>
            <p className="text-gray-600">{chartDescription}</p>
        </div>
        <div className="space-y-3">
        <div className="h-80 w-full">
        <ResponsiveContainer>
        <BarChart data={selectedData.items}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label">
            <Label value="Date" offset={-5} position="insideBottom" />
            </XAxis>
            <YAxis>
            <Label
                value="$"
                angle={-90}
                position="insideLeft"
                style={{ textAnchor: "middle" }}
            />
            </YAxis>
            <Tooltip/>
        </BarChart>
        </ResponsiveContainer>
        </div>
        </div>
      </div>

      {/* Detail Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {selectedData?.title}
          </h2>
          <p className="text-gray-600">{selectedData?.description}</p>
        </div>

        <div className="space-y-3">
          {selectedData?.items.map((item, index) => (
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
  );
};
