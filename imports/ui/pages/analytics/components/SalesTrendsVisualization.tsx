import React, { useMemo } from "react";
import { Transaction } from "/imports/api/transactions/TransactionsCollection";
import { TimeFrame } from "../Analytics";

interface SalesTrendsVisualizationProps {
  transactions: Transaction[];
  timeFrame: TimeFrame;
  customDateRange?: { start: Date; end: Date } | null;
}

interface SalesDataPoint {
  period: string;
  totalSales: number;
  itemCount: number;
}

export const SalesTrendsVisualization: React.FC<SalesTrendsVisualizationProps> = ({
  transactions,
  timeFrame,
  customDateRange,
}) => {
  const salesData = useMemo(() => {
    const now = new Date();
    let periods: string[] = [];
    let startDate: Date;
    let endDate: Date = now;

    if (timeFrame === "custom" && customDateRange) {
      startDate = customDateRange.start;
      endDate = customDateRange.end;
      // For custom ranges, create daily periods
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
      periods = Array.from({ length: Math.min(daysDiff, 30) }, (_, i) => `Day ${i + 1}`);
    } else {
      switch (timeFrame) {
        case "day":
          // Last 24 hours in 4-hour blocks
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          periods = ["00-04", "04-08", "08-12", "12-16", "16-20", "20-24"];
          break;
        case "week":
          // Last 7 days
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          periods = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          break;
        case "month":
          // Last 4 weeks
          startDate = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
          periods = ["Week 1", "Week 2", "Week 3", "Week 4"];
          break;
        case "year":
          // Last 12 months
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          periods = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          periods = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      }
    }

    const filteredTransactions = transactions.filter(
      (t) => {
        const transactionDate = new Date(t.createdAt);
        return transactionDate >= startDate && transactionDate <= endDate;
      }
    );

    // Group transactions by period
    const periodMap = new Map<string, SalesDataPoint>();
    periods.forEach(period => {
      periodMap.set(period, { period, totalSales: 0, itemCount: 0 });
    });

    filteredTransactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      let period: string;
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      if (timeFrame === "custom" && customDateRange) {
        const dayDiff = Math.floor((transactionDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        period = `Day ${dayDiff + 1}`;
      } else {
        switch (timeFrame) {
          case "day":
            const hour = transactionDate.getHours();
            if (hour < 4) period = "00-04";
            else if (hour < 8) period = "04-08";
            else if (hour < 12) period = "08-12";
            else if (hour < 16) period = "12-16";
            else if (hour < 20) period = "16-20";
            else period = "20-24";
            break;
          case "week":
            // const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            period = days[transactionDate.getDay()];
            break;
          case "month":
            const weekDiff = Math.floor((now.getTime() - transactionDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
            period = `Week ${4 - weekDiff}`;
            break;
          case "year":
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            period = months[transactionDate.getMonth()];
            break;
          default:
            period = days[transactionDate.getDay()];
        }
      }

      const existing = periodMap.get(period);
      if (existing) {
        existing.totalSales += transaction.quantity * transaction.price;
        existing.itemCount += transaction.quantity;
      }
    });

    return Array.from(periodMap.values());
  }, [transactions, timeFrame, customDateRange]);

  const maxSales = Math.max(...salesData.map(d => d.totalSales), 1);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Sales Trends</h2>
      
      {/* Summary */}
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-sm text-green-800">
          <span className="font-semibold">Total Sales:</span> ${salesData.reduce((sum, d) => sum + d.totalSales, 0).toFixed(2)}
        </p>
        <p className="text-xs text-green-600 mt-1">
          This data supports inventory planning decisions
        </p>
      </div>

      {/* Chart */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-700">
          Sales Over Time ({timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)})
        </h3>
        
        {salesData.some(d => d.totalSales > 0) ? (
          <div className="relative">
            {/* SVG Chart */}
            <svg
              width="100%"
              height="200"
              className="border border-gray-200 rounded-lg bg-white"
            >
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                <line
                  key={i}
                  x1="0"
                  y1={200 * ratio}
                  x2="100%"
                  y2={200 * ratio}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}

              {/* Bars */}
              {salesData.map((dataPoint, index) => {
                const barHeight = (dataPoint.totalSales / maxSales) * 160;
                const barWidth = 100 / salesData.length - 2;
                const x = (index * 100) / salesData.length + 1;
                const y = 180 - barHeight;

                return (
                  <g key={dataPoint.period}>
                    <rect
                      x={`${x}%`}
                      y={y}
                      width={`${barWidth}%`}
                      height={barHeight}
                      fill="#8b5cf6"
                      rx="2"
                    />
                    <text
                      x={`${x + barWidth / 2}%`}
                      y="195"
                      textAnchor="middle"
                      className="text-xs fill-gray-600"
                    >
                      {dataPoint.period}
                    </text>
                    <text
                      x={`${x + barWidth / 2}%`}
                      y={y - 5}
                      textAnchor="middle"
                      className="text-xs fill-gray-800 font-medium"
                    >
                      ${dataPoint.totalSales.toFixed(0)}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Legend */}
            <div className="flex justify-center mt-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-3 h-3 bg-press-up-purple rounded"></div>
                <span>Sales Revenue</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No sales data available for this time period</p>
        )}
      </div>
    </div>
  );
}; 