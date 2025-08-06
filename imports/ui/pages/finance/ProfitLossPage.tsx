import React, { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { FinanceCard } from "../../components/FinanceCard";
import { Meteor } from 'meteor/meteor'

interface DetailItemProps {
  label: string;
  amount: number;
  percentage?: number;
}

const DetailItem = ({ label, amount, percentage }: DetailItemProps) => {
  const isPositive = amount > 0;
  const sign = amount < 0 ? '-' : '';
  
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
    const [selectedMetric, setSelectedMetric] = useState('netProfitLoss');
    const [financialData, setFinancialData] = useState<any | null>(null);

    useEffect(() => {
        setPageTitle("Finance - Profit Loss Page");
     
        const fetchData = async () => {
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

    const itemMap = financialData?.revenue.items.reduce((acc, item) => {
        acc[item.label] = item.amount;
        return acc;
    }, {});

    const mainMetrics = [
        { key: 'revenue', title: 'Total Revenue', amount: itemMap['Total Revenue'] ?? 0 },
        { key: 'expenses', title: 'Total Expenses', amount: itemMap['Total Expenses'] ?? 0 },
        { key: 'netProfitLoss', title: 'Net Profit/Loss', amount: itemMap['Net Profit/Loss'] ?? 0 },
    ];

    const currentData = financialData[selectedMetric] || {
        title: "No data available",
        description: "",
        items: []
    };

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
            {/* <div className="md:col-span-3 flex justify-center">
                <div className="w-full md:w-1/3">
                <FinanceCard
                    title="Gross Profit"
                    amount={financialData.netProfitLoss.items.find(i => i.label === 'Gross Profit')?.amount ?? 0}
                    showCurrency={false}
                    isSelected={selectedMetric === 'netProfitLoss'}
                    onClick={() => setSelectedMetric('netProfitLoss')}
                />
                </div>
            </div> */}
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
            </div>
        </div>
    );
}