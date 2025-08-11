import React, { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { FinanceCard } from "../../components/FinanceCard";
import { Meteor } from 'meteor/meteor'
import { Order, OrderMenuItem } from "../../api/orders/orders";

interface FinancialData {
  revenue: {
    title: string;
    description: string;
    items: { label: string; amount: number; percentage: number }[];
    total: number;
  };
  expenses: {
    title: string;
    description: string;
    items: { label: string; amount: number; percentage: number }[];
  };
  netProfitLoss: {
    title: string;
    description: string;
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
  const sign = amount < 0 ? '-' : '';
  
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
    const [financialData, setFinancialData] = useState<FinancialData | null>(null);

    // processes and calculates order data
    const processOrderData = (orders: Order[]): FinancialData => {
      const revenueByCat: { [key: string]: number } = {};

      let totalRevenue = 0;

      orders.forEach(order => {
        if (!order.paid) return;

        let orderRevenue = 0;

        order.menuItems.forEach(menuItem => {
          const itemRevenue = menuItem.price * menuItem.quantity;

          orderRevenue += itemRevenue; // prevents double counting

          const categories = menuItem.category && menuItem.category.length > 0 ? menuItem.category : ['uncategorized'];
        
          categories.forEach(category => {
            revenueByCat[category] = (revenueByCat[category] || 0) + itemRevenue;
          });
        });
        totalRevenue += orderRevenue;
      });

      const revenueItems = Object.keys(revenueByCat).map(category => ({
        label: category,
        amount: revenueByCat[category],
        percentage: (revenueByCat[category] / totalRevenue) * 100,
      }));

      const totalExpenses = 10; // assume
      const netProfit = totalRevenue - totalExpenses;

      return {
        revenue: {
          title: "Revenue Breakdown",
          description: "Detailed breakdown of revenue.",
          items: revenueItems,
          total: totalRevenue
        },
        expenses: {
          title: "Revenue Breakdown",
          description: "Detailed breakdown of expenses.",
          items: [{ label: "Operating Expenses", amount: totalExpenses, percentage: 100 }] // need to change later to actual expenses
        },
        netProfitLoss: {
          title: "Revenue Breakdown",
          description: "Detailed breakdown of net profit/loss.",
          items: [
            { label: "Total Revenue", amount: totalRevenue },
            { label: "Total Expenses", amount: -totalExpenses },
            { label: "Net Profit/Loss", amount: netProfit }
          ]
        }
      }}
    
    useEffect(() => {
      setPageTitle("Finance - Profit Loss Page");
    
      const fetchOrders = async () => {
        try {
            const result = await Meteor.callAsync('orders.getAll') as Order[];
            const processedData = processOrderData(result);
            setFinancialData(processedData);
        } catch (error) {
            console.error("Error fetching order data", error);
        }
      };
      fetchOrders();
    }, [setPageTitle]);

    if (!financialData) {
        return <div className="w-full p-6 bg-gray-50 min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const mainMetrics = [
      { 
        key: 'revenue', 
        title: 'Total Revenue', 
        description: financialData.revenue.description,
        amount: financialData.revenue.total,
        items: financialData.revenue.items
      },
      { 
        key: 'expenses', 
        title: 'Total Expenses', 
        description: financialData.expenses.description,
        amount: financialData.expenses.items.reduce((sum, item) => sum + item.amount, 0),
        items: financialData.expenses.items
      },
      { 
        key: 'netProfitLoss', 
        title: 'Net Profit/Loss', 
        description: financialData.netProfitLoss.description,
        amount: financialData.netProfitLoss.items.find(i => i.label === 'Net Profit/Loss')?.amount ?? 0,
        items: financialData.netProfitLoss.items
      },
    ];

    const selectedData = mainMetrics.find(m => m.key === selectedMetric);

    if (!selectedMetric) {
      return <div className="w-full p-6 bg-gray-50 min-h-screen flex items-center justify-center">Data not found.</div>;
    }

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
        
        {/* Gross Profit Card, might not need*/}
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
            {selectedData.title}
            </h2>
            <p className="text-gray-600">{selectedData.description}</p>
          </div>

          <div className="space-y-3">
            {selectedData.items.map((item, index) => (
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