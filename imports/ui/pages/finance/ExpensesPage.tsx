import React, { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { FinanceCard } from "../../components/FinanceCard";
import { FinanceDateFilter } from "../../components/FinanceDateFilter";
import { Meteor } from "meteor/meteor";
import { Order } from "../../api/orders/orders";
import { PurchaseOrder } from "../../api/purchaseOrders/PurchaseOrdersCollection";
import {
  format,
  startOfToday,
  startOfWeek,
  startOfMonth,
  startOfYear,
  subDays,
  endOfToday, endOfWeek, endOfMonth, endOfYear
} from "date-fns";

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
        {percentage !== undefined && (
          <span className="ml-2 text-sm text-gray-500">({percentage}% of total)</span>
        )}
      </div>
      <div className={`font-semibold text-lg ${isPositive ? "text-green-700" : "text-red-700"}`}>
        ${sign}
        {Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </div>
    </div>
  );
};

export const ExpensesPage = () => {
    const [_, setPageTitle] = usePageTitle();
    const [selectedMetric, setSelectedMetric] = useState<"revenue" | "expenses">("revenue");
    const [financialData, setFinancialData] = useState<any | null>(null);

    const [dateRange, setDateRange] = useState<
            | "all"
            | "today"
            | "thisWeek"
            | "thisMonth"
            | "thisYear"
            | "past7Days"
            | "past30Days"
        >("all");
    
        const getDateRange = (range: typeof dateRange): { start: Date; end: Date } => {
            const today = startOfToday();
            let start: Date;
            let end: Date;

            switch (range) {
            case "today":
                start = today;
                end = endOfToday();
                break;
            case "thisWeek":
                start = startOfWeek(today, { weekStartsOn: 1 });
                end = endOfWeek(today, { weekStartsOn: 1 });
                break;
            case "thisMonth":
                start = startOfMonth(today);
                end = endOfMonth(today);
                break;
            case "thisYear":
                start = startOfYear(today);
                end = endOfYear(today);
                break;
            case "past7Days":
                start = subDays(today, 6);
                end = endOfToday();
                break;
            case "past30Days":
                start = subDays(today, 29);
                end = endOfToday();
                break;
            case "all":
            default:
                start = new Date(0); // all orders
                end = new Date();
            }
            return { start, end };
        };

    const getDateRangeText = (range: typeof dateRange): string => {
        const { start, end } = getDateRange(range);
        if (range === "all") return "All Time";
        return `${format(start, "dd/MM/yy")} – ${format(end, "dd/MM/yy")}`;
    };

    const fetchFinancialData = async () => {
        try {
            const orders = (await Meteor.callAsync("orders.getAll")) as Order[];
            const purchaseOrders = (await Meteor.callAsync('purchaseOrders.getAll')) as PurchaseOrder[];

            const { start, end } = getDateRange(dateRange);

            // filter orders by date
            const filteredOrders = orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= start && orderDate <= end && order.paid;
            });

            const filteredPurchaseOrders = purchaseOrders.filter(purchase => {
                let purchaseDate: Date;
                if (purchase.date instanceof Date) {
                    purchaseDate = purchase.date
                } else {
                    purchaseDate = new Date(purchase.date)
                }
                return purchaseDate >= start && purchaseDate <= end;
            })

            // Calc sales
            let salesTotal = 0;
            const salesByCategory: { [key: string]: number } = {};

            filteredOrders.forEach(order => {
                if (!order.paid) return;

                order.menuItems.forEach(item => {
                    const itemAmount = item.price * item.quantity;
                    salesTotal += itemAmount;

                    const categories = item.category?.length ? item.category: ["uncategorized"];
                    categories.forEach(cat => {
                        salesByCategory[cat] = (salesByCategory[cat] || 0) + itemAmount;
                    });
                });
            });

            const salesItems = Object.keys(salesByCategory).map(cat => ({
                label: cat,
                amount: salesByCategory[cat],
                percentage: ((salesByCategory[cat] / salesTotal) * 100).toFixed(2),
            }));

            // Calc expenses
            let expenses = 0;
            const expensesBySupplier: { [key: string]: number } = {};

            filteredPurchaseOrders.forEach(purchase =>{
                const purchaseAmount = purchase.totalCost;
                expenses += purchaseAmount;

                const supplier = purchase.supplier?.toString() || "Unknown Supplier";
                expensesBySupplier[supplier] = (expensesBySupplier[supplier] || 0) + purchaseAmount;
            })

            const expenseItems = Object.keys(expensesBySupplier).map(supplier => ({
                label: supplier,
                amount: expensesBySupplier[supplier],
                percentage: ((expensesBySupplier[supplier]/ expenses) * 100).toFixed(2),
            }));

            setFinancialData({
                sales: {
                    title: "Sales Breakdown by Category",
                    description: "Revenue generated from processed sales orders",
                    items: salesItems,
                    total: salesTotal,
                },
                expenses: {
                    title: "Expenses Breakdown by Supplier",
                    description: "Expenses generated from supplier orders",
                    items: expenseItems,
                    total: expenses
                },
            });
        } catch (error) {
            console.error("Error fetching financial data", error)
        }
    }

    useEffect(() => {
        setPageTitle("Finance - Sales & Expense Tracking");
        fetchFinancialData();
    }, [setPageTitle, dateRange]);

    if (!financialData) {
        return (
        <div className="w-full p-6 bg-gray-50 min-h-screen flex items-center justify-center">
            Loading...
        </div>
        );
    }

    const mainMetrics = [
        { key: "sales", title: "Total Sales", amount: financialData.sales.total },
        { key: "expenses", title: "Total Expenditure", amount: financialData.expenses.total },
    ] as const;

    const currentData = financialData[selectedMetric] || {
        title: "No data available",
        description: "",
        items: [],
    };

    return (
        <div className="flex flex-col flex-1 overflow-y-auto max-h-screen">
            <div className="w-full p-6 bg-gray-50 min-h-[100vh]">
            <div className="flex items-baseline gap-4 mb-4">
                <FinanceDateFilter range={dateRange} onRangeChange={setDateRange} />
                <h2 className="ml-4 text-red-900">
                <span className="font-bold">Viewing Period:</span>{" "}
                <span className="font-normal">{getDateRangeText(dateRange)}</span>
                </h2>
            </div>
            
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

            {/* Detail Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {currentData.title}
                    {/* {selectedMetric === "revenue" ? "Sales breakdown" : "Expenditure breakdown"} */}
                </h2>
                {/* <p className="text-gray-600">{currentData.title} — {currentData.description}</p> */}
                <p className="text-gray-600">{currentData.description}</p>
                </div>

                <div className="space-y-3">
                {(currentData.items || []).map((item: any, index: number) => (
                    <DetailItem
                    key={index}
                    label={item.label}
                    amount={item.amount ?? 0}
                    percentage={item.percentage}
                    />
                ))}
                </div>
            </div>
            </div>
        </div>
    );
};