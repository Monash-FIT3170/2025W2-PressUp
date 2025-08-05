import React, { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { FinanceCard } from "../../components/FinanceCard"

interface DetailItemProps {
  label: string;
  amount: number;
  percentage?: number;
}

const DetailItem = ({ label, amount, percentage }: DetailItemProps) => {
  const isPositive = amount > 0;
  const sign = isPositive ? '+' : '';
  
  return (
    <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex-1">
        <span className="font-medium text-gray-800">{label}</span>
        {percentage && (
          <span className="ml-2 text-sm text-gray-500">
            ({percentage}% of total)
          </span>
        )}
      </div>
      <div className={`font-semibold text-lg ${
        isPositive ? 'text-green-700' : 'text-red-700'
      }`}>
        ${sign}{Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </div>
    </div>
  );
};

export const ProfitLossPage = () => {
    const [_, setPageTitle] = usePageTitle();
    const [selectedMetric, setSelectedMetric] = useState('gross profit');

    useEffect(() => {
        setPageTitle("Finance - Profit Loss Page");
    }, [setPageTitle]);

     // Sample financial data
    const financialData = {
        revenue: {
        title: "Revenue Breakdown",
        description: "Detailed breakdown of all revenue sources",
        items: [
            { label: "Food Sales", amount: 15240, percentage: 60.0 },
            { label: "Drink Sales", amount: 7620, percentage: 30.0 },
            { label: "Dessert Sales", amount: 1524, percentage: 6.0 },
            { label: "Catering Services", amount: 762, percentage: 3.0 },
            { label: "Other Revenue", amount: 256, percentage: 1.0 }
        ]
        },
        expenses: {
        title: "Expense Breakdown", 
        description: "Detailed breakdown of all business expenses",
        items: [
            { label: "Ingredients", amount: -3200, percentage: 36.8 },
            { label: "Drinks", amount: -1800, percentage: 20.7 },
            { label: "Staff Wages", amount: -2500, percentage: 28.8 },
            { label: "Utilities", amount: -650, percentage: 7.5 },
            { label: "Supplies & Equipment", amount: -380, percentage: 4.4 },
            { label: "Marketing", amount: -158, percentage: 1.8 }
        ]
        },
        netProfitLoss: {
        title: "Financial Overview",
        description: "Summary of all financial metrics for the current period",
        items: [
            { label: "Total Revenue", amount: 25402, percentage: 100 },
            { label: "Total Expenses", amount: -8688, percentage: 34.2 },
            { label: "Gross Profit", amount: 16714, percentage: 65.8 },
            { label: "Operating Expenses", amount: -5026, percentage: 19.8 },
            { label: "Net Profit/Loss", amount: 11688, percentage: 46.0 }
        ]
        }
    };

    const mainMetrics = [
        { key: 'revenue', title: 'Total Revenue', amount: 25402 },
        { key: 'expenses', title: 'Total Expenses', amount: -8688 },
        { key: 'profit', title: 'Net Profit/Loss', amount: 16714 }
    ];

    const currentData = financialData[selectedMetric as keyof typeof financialData] || financialData.netProfitLoss;

    return (
        <div className="w-full p-6 bg-gray-50 min-h-screen">
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
            
            {/* Gross Profit Card */}
            <div className="md:col-span-3 flex justify-center">
                <div className="w-full md:w-1/3">
                <FinanceCard
                    title="Gross Profit"
                    amount={0}
                    showCurrency={false}
                    isSelected={selectedMetric === 'netProfitLoss'}
                    onClick={() => setSelectedMetric('netProfitLoss')}
                />
                </div>
            </div>
            </div>

            {/* Detail Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {currentData.title}
                </h2>
                <p className="text-gray-600">{currentData.description}</p>
            </div>

            <div className="space-y-3">
                {currentData.items.map((item, index) => (
                <DetailItem
                    key={index}
                    label={item.label}
                    amount={item.amount}
                    percentage={item.percentage}
                />
                ))}
            </div>

            {/* Summary Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-lg font-semibold">
                <span className="text-gray-700">
                    {selectedMetric === 'expenses' ? 'Total Expenses:' : 
                    selectedMetric === 'revenue' ? 'Total Revenue:' : 
                    'Net Result:'}
                </span>
                <span className={`${
                    selectedMetric === 'expenses' ? 'text-red-700' : 'text-green-700'
                }`}>
                    ${selectedMetric === 'expenses' ? '8,688.00' : 
                    selectedMetric === 'revenue' ? '25,402.00' : 
                    '16,714.00'}
                </span>
                </div>
            </div>
            </div>
        </div>
    );
}