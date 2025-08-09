import React, { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { FinanceCard } from "../../components/FinanceCard";
import { FinanceDateFilter } from "../../components/FinanceDateFilter";
import { Meteor } from "meteor/meteor";

export const ExpensesPage = () => {
    const [_, setPageTitle] = usePageTitle();
    const [selectedMetric, setSelectedMetric] = useState<"revenue" | "expenses">("revenue");
    const [financialData, setFinancialData] = useState<any | null>(null);

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
            </div>
        </div>
    );
};