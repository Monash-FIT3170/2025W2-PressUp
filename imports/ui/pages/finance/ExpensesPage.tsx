import React, { useState, useEffect, useMemo } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { FinanceCard } from "../../components/FinanceCard";
import { FinanceDateFilter } from "../../components/FinanceDateFilter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface ExpenseData {
  totalExpenses: number;
  expensesByCategory: Array<{
    category: string;
    amount: number;
  }>;
  expensesByMonth: Array<{
    month: string;
    amount: number;
  }>;
}

export const ExpensesPage = () => {
  const [_, setPageTitle] = usePageTitle();
  const [dateRange, setDateRange] = useState<
    | "all"
    | "today"
    | "thisWeek"
    | "thisMonth"
    | "thisYear"
    | "past7Days"
    | "past30Days"
  >("thisMonth");

  useEffect(() => {
    setPageTitle("Expenses");
  }, [setPageTitle]);

  const expenseData = useMemo((): ExpenseData => {
    // This would typically come from a Meteor method or subscription
    // For now, returning mock data structure
    return {
      totalExpenses: 0,
      expensesByCategory: [],
      expensesByMonth: [],
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full overflow-y-scroll p-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold">Expenses</h1>

        <FinanceDateFilter range={dateRange} onRangeChange={setDateRange} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FinanceCard
            title="Total Expenses"
            amount={expenseData.totalExpenses}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expenseData.expensesByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                <Bar dataKey="amount" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              Monthly Expenses Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expenseData.expensesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                <Bar dataKey="amount" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
