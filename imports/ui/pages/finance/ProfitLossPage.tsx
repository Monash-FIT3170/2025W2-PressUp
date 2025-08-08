import React, { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { FinanceCard } from "../../components/FinanceCard";
import { Meteor } from 'meteor/meteor'
import { Order, OrderMenuItem } from "../../api/orders/orders";

interface CategoryBreakdown {
  [category: string]: {
    amount: number;
    items: string[];
    count: number;
  };
}

interface FinancialData {
  revenue: {
    title: string;
    description: string;
    items: { label: string; amount: number; percentage: number }[];
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
    const [orderData, setOrderData] = useState<any | null>(null);
    const [financialData, setFinancialData] = useState<FinancialData | null>(null);

    // processes and calculates order data
    const processOrderData = (orders: Order[]): FinancialData => {
      const revenue: CategoryBreakdown = {};
      const expenses: CategoryBreakdown = {};

      let totalRevenue = 0;
      let totalExpenses = 0;

      orders.forEach(order => {
        if (!order.paid) return;

        const orderRevenue = order.totalPrice; // need to check if total price and discounted price are the same
        totalRevenue += orderRevenue;

        // can consider total in discounts as a part of a category

        order.menuItems.forEach(menuItem => {
          const itemRevenue = menuItem.price * menuItem.quantity;

          const categories = menuItem.category && menuItem.category.length > 0 ? menuItem.category : ['uncategorized'];
        
          categories.forEach(category => {
              if (!revenue[category]) {
                  revenue[category] = { amount: 0, items: [], count: 0 };
              }
              
              revenue[category].amount += itemRevenue;
              revenue[category].count += menuItem.quantity;
              
              // Add item name if not already in the list
              if (!revenue[category].items.includes(menuItem.name)) {
                  revenue[category].items.push(menuItem.name);
              }
          });
        });
      }

      const netProfitLoss: CategoryBreakdown = {};

      Object.entries(revenue).forEach(([category, data]) => {
        const expenseCategory = `${category}_costs`;
        const categoryExpenses = expenses[expenseCategory]?.amount || 0;
        
        netProfitLoss[category] = {
          amount: data.amount - categoryExpenses,
          items: data.items,
          count: data.count
        };
      });

      const netProfit = totalRevenue - totalExpenses;

      // test for now
      const revenueItems = {
        label: "Food",
        amount: 1000,
        percentage: 100,
      }

      return {
        revenue: {
          title: "Revenue Breakdown",
          description: "Detailed breakdown of revenue.",
          items: [revenueItems]
        },
        expenses: {
          title: "Revenue Breakdown",
          description: "Detailed breakdown of expenses.",
          items: [revenueItems]
        },
        netProfitLoss: {
          title: "Revenue Breakdown",
          description: "Detailed breakdown of net profit/loss.",
          items: [revenueItems]
        }
      }}
    
    useEffect(() => {
      setPageTitle("Finance - Profit Loss Page");
    
      const fetchOrders = async () => {
        try {
            const result = await Meteor.callAsync('orders.getAll') as Order[];
            setOrderData(result);
            
            // Process the orders to get financial data
            const processedData = processOrderData(result);
            setFinancialData(processedData);
        } catch (error) {
            console.error("Error fetching order data", error);
        }
      };
      fetchOrders();
    }, [setPageTitle]);

    if (!orderData) {
        return <div className="w-full p-6 bg-gray-50 min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const mainMetrics = [
      { 
        key: 'revenue', 
        title: 'Total Revenue', 
        description: financialData.revenue.description,
        amount: financialData.revenue.items.find(i => i.label === 'Net Profit/Loss')?.amount ?? 0,
        items: financialData.revenue.items
      },
      { 
        key: 'expenses', 
        title: 'Total Expenses', 
        description: financialData.expenses.description,
        amount: financialData.expenses.items.find(i => i.label === 'Net Profit/Loss')?.amount ?? 0,
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