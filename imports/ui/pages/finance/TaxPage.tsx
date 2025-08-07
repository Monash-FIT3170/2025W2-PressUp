import React, { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { FinanceCard } from "../../components/FinanceCard";
import { FinanceDateFilter } from "../../components/FinanceDateFilter";
import { Meteor } from 'meteor/meteor'
import {
    format,
    startOfToday,
    startOfWeek,
    startOfMonth,
    startOfYear,
    subDays,
  } from "date-fns";

export const TaxPage = () => {
    const [_, setPageTitle] = usePageTitle();
    const [selectedMetric, setSelectedMetric] = useState('netTax');
    const [financialData, setFinancialData] = useState<any | null>(null);
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

    useEffect(() => {
        setPageTitle("Finance - Tax Page");

        const fetchData = async () => {
            //fetch relevant data
            try {
                const result = await Meteor.callAsync('finance.getFinanceData');
                setFinancialData(result);
            } catch (error) {
                console.error("Error fetching finance data", error);
            }
        };
        fetchData();
    }, [setPageTitle]);

    if (!financialData) {
        return <div className="w-full p-6 bg-gray-50 min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const itemMap = financialData?.revenue.items.reduce((acc: { [x: string]: any; }, item: { label: string | number; amount: any; }) => {
        acc[item.label] = item.amount;
        return acc;
    }, {});

    const mainMetrics = [
        { key: 'GST', title: 'GST Collected', amount: itemMap['Total GST'] ?? 0 },
        { key: 'payrollTax', title: 'Payroll Tax Payable', amount: itemMap['Payroll Tax'] ?? 0 },
        { key: 'incomeTax', title: 'Income Tax on Profits', amount: itemMap['Income Tax'] ?? 0 },
    ];

    const currentData = financialData[selectedMetric] || {
        title: "No data available",
        description: "",
        items: []
    };

    return (
        <div className="w-full p-6 bg-gray-50 min-h-screen">
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

            {/* Detail Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                </h2>
            </div>
            </div>
        </div>
    );
}