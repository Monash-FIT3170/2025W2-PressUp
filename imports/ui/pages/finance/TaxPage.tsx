import React, { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { FinanceCard } from "../../components/FinanceCard";
import { FinanceDateFilter } from "../../components/FinanceDateFilter";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { OrdersCollection } from "/imports/api/orders/OrdersCollection";
import { PurchaseOrdersCollection } from "/imports/api/purchaseOrders/PurchaseOrdersCollection";
import {
    format,
    startOfToday,
    startOfWeek,
    startOfMonth,
    startOfYear,
    subDays,
    endOfWeek,
    endOfToday,
    endOfMonth,
    endOfYear,
  } from "date-fns";
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

interface FinancialDataField {
  title: string;
  description: string;
  items: { label: string; amount: number }[];
  total: number;
}

export const TaxPage = () => {
    const [_, setPageTitle] = usePageTitle();
    const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
    const [dateRange, setDateRange] = React.useState<
        | "all"
        | "today"
        | "thisWeek"
        | "thisMonth"
        | "thisYear"
        | "past7Days"
        | "past30Days"
        >("all");

    useSubscribe("orders");
    useSubscribe("purchaseOrders");

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

    const financialData: Record<string, FinancialDataField> = useTracker(() => {
        const orders = OrdersCollection.find().fetch();
        const purchaseOrders = PurchaseOrdersCollection.find().fetch();

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

        // date format for graph
        const formatDateKey = (date: Date, range: typeof dateRange) => {
            switch (range) {
            case "thisYear":
                return format(date, "MMM"); // just display month label
            case "all":
                return format(date, "dd/MM/yy"); // label format for all
            case "thisMonth":
            case "past30Days":
            case "thisWeek":
            case "past7Days":
            case "today":
            default:
                return format(date, "dd/MM"); // daily buckets
            }
        };

        // GST on sales
        let GSTTotal = 0;
        const GSTByDate: { [key: string]: number } = {};

        filteredOrders.forEach(order => {
          if (!order.paid) return;

          const orderDate = new Date(order.createdAt);
          const dateKey = formatDateKey(orderDate, dateRange);

          order.menuItems.forEach(item => {
            const itemAmount = item.price * item.quantity;
            const gst = itemAmount / 11;

            GSTTotal += gst;
            GSTByDate[dateKey] = (GSTByDate[dateKey] || 0) + gst;
          });
        });

        const GSTItems = Object.keys(GSTByDate).map(date => ({
            label: date,
            amount: GSTByDate[date],
          }));

        // GST on expenses
        let GSTexpenses = 0;
        const expensesByDate: { [key: string]: number } = {};

        filteredPurchaseOrders.forEach(purchase =>{
            const purchaseAmount = purchase.totalCost;
            const gst = purchaseAmount / 11;
            GSTexpenses += gst;

            const purchaseDate = new Date(purchase.date);
            const dateKey = formatDateKey(purchaseDate, dateRange);
            expensesByDate[dateKey] = (expensesByDate[dateKey] || 0) + gst;
        })

        const expenseItems = Object.keys(expensesByDate).map(date => ({
            label: date,
            amount: expensesByDate[date],
        }));

        return {
            GSTCollected: {
                title: "GST Collected",
                description: "Goods and Services Tax collected on orders",
                items: GSTItems,
                total: GSTTotal,
            },
            GSTPaid: {
                title: "GST Paid",
                description: "Goods and Services Tax paid on stock orders",
                items: expenseItems,
                total: GSTexpenses
            },
            incomeTax: {
                title: "Income Tax",
                description: "Estimated income Tax",
                items: expenseItems,
                total: GSTexpenses
            },
        };
    }, [dateRange]);

    useEffect(() => {
        setPageTitle("Finance - Tax Management");
    }, [setPageTitle]);



    const mainMetrics = [
        { key: "GSTCollected", title: "Total GST Collected", amount: financialData.GSTCollected.total },
        { key: "GSTPaid", title: "Total GST Paid", amount: financialData.GSTPaid.total },
        { key: "incomeTax", title: "Estimated Income Tax", amount: financialData.incomeTax.total }, //TODO
    ] as const;

    const currentData = selectedMetric && selectedMetric in financialData
        ? financialData[selectedMetric]
        : null;

    const combinedItems = (() => {
        const collectedMap = Object.fromEntries(
          financialData.GSTCollected.items.map((i) => [i.label, i.amount])
        );
        const paidMap = Object.fromEntries(
          financialData.GSTPaid.items.map((i) => [i.label, i.amount])
        );

        const allLabels = Array.from(
          new Set([
            ...financialData.GSTCollected.items.map((i) => i.label),
            ...financialData.GSTPaid.items.map((i) => i.label),
          ])
        );

        return allLabels.map((label) => ({
          label,
          collected: collectedMap[label] || 0,
          paid: paidMap[label] || 0,
        }));
      })();

    let chartTitle = selectedMetric ? currentData?.title : "GST Collected vs GST Paid";
    let chartDescription = selectedMetric ? currentData?.description : "Comparison of GST collected on sales and GST paid on expenses";

    return (
        <div className="flex flex-col flex-1 overflow-y-auto max-h-screen pb-10">
            <div className="w-full p-6 bg-gray-50 min-h-[100vh]">
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

            {/* Graph Section for GST*/}
            <div className="bg-white md:w-3/5 rounded-xl shadow-lg p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{chartTitle}</h2>
                    <p className="text-gray-600">{chartDescription}</p>
                </div>
                <div className="space-y-3">
                <div className="h-80 w-full">
                <ResponsiveContainer>
                <BarChart data={currentData ? currentData.items : combinedItems}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label">
                    <Label value="Date" offset={-5} position="insideBottom" />
                    </XAxis>
                    <YAxis>
                    <Label
                        value="GST ($)"
                        angle={-90}
                        position="insideLeft"
                        style={{ textAnchor: "middle" }}
                    />
                    </YAxis>
                    <Tooltip />

                    {currentData ? (
                    // Single dataset (when a card is selected)
                    <Bar dataKey="amount" fill="#c6b6cf" />
                    ) : (
                    // Both datasets (when no card is selected)
                    <>
                        <Bar dataKey="collected" fill="#6f597b" name="GST Collected" />
                        <Bar dataKey="paid" fill="#c6b6cf" name="GST Paid" />
                    </>
                    )}
                </BarChart>
                </ResponsiveContainer>
                </div>
                </div>
            </div>
        </div>
        </div>
    );
}
