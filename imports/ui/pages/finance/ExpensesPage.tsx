import React, { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { FinanceCard } from "../../components/FinanceCard";
import { FinanceDateFilter } from "../../components/FinanceDateFilter";
import { Meteor } from "meteor/meteor";
import {
  format,
  startOfToday,
  startOfWeek,
  startOfMonth,
  startOfYear,
  subDays,
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
    
        const getDateRangeText = (range: typeof dateRange): string => {
            const today = startOfToday();
            const end = today;
            let start: Date;
            switch (range) {
            case "today":
                start = today;
                break;
            case "thisWeek":
                start = startOfWeek(today, { weekStartsOn: 1 });
                break;
            case "thisMonth":
                start = startOfMonth(today);
                break;
            case "thisYear":
                start = startOfYear(today);
                break;
            case "past7Days":
                start = subDays(today, 6);
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

    useEffect(() => {
        setPageTitle("Finance - Expense Tracking");

        const fetchData = async () => {
        try {
            const result = await Meteor.callAsync("finance.getFinanceData");
            setFinancialData(result);
        } catch (error) {
            console.error("Error fetching finance data", error);
        }
        };
        fetchData();
    }, [setPageTitle]);

    if (!financialData) {
        return (
        <div className="w-full p-6 bg-gray-50 min-h-screen flex items-center justify-center">
            Loading...
        </div>
        );
    }

    const sumItems = (items: any[] = []) => items.reduce((s, it) => s + (it.amount ?? 0), 0);

    const revenueTotal = financialData.revenue?.total ?? sumItems(financialData.revenue?.items);
    const expensesTotal = financialData.expenses?.total ?? sumItems(financialData.expenses?.items);

    const mainMetrics = [
        { key: "revenue", title: "Total Sales", amount: revenueTotal },
        { key: "expenses", title: "Total Expenditure", amount: expensesTotal },
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
                    {selectedMetric === "revenue" ? "Sales breakdown" : "Expenditure breakdown"}
                </h2>
                <p className="text-gray-600">{currentData.title} — {currentData.description}</p>
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