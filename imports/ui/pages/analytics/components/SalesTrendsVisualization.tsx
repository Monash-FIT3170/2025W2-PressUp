import React, { useMemo } from "react";
import { Order } from "/imports/api/orders/OrdersCollection";


interface SalesTrendsVisualizationProps {
  orders: Order[];
  dateRangeBounds: { start: Date | null; end: Date | null } | null;
}

interface SalesDataPoint {
  period: string;
  totalSales: number;
  itemCount: number;
}

export const SalesTrendsVisualization: React.FC<SalesTrendsVisualizationProps> = ({
  orders,
  dateRangeBounds,
}) => {
  const { start, end } = dateRangeBounds || { start: null, end: null };

  const salesData = useMemo(() => {

    if (!orders || orders.length === 0) return [];
    let periods: string[] = [];

    if (start && end) {
      const daysDiff = Math.ceil(
        (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
      );
      periods = Array.from({ length: daysDiff + 1 }, (_, i) => {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      });
    } else {
      const today = new Date();
      periods = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (6 - i));
        return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      });
    }


    // Group transactions by period
    const periodMap = new Map<string, SalesDataPoint>();
    periods.forEach((period) =>
      periodMap.set(period, { period, totalSales: 0, itemCount: 0 })
    );

    orders.forEach((order) => {
      if (!order.paid) return;

      const orderDate = new Date(order.createdAt);
      if (
        (start && orderDate < start) ||
        (end && orderDate > end)
      )
        return;

      const periodKey = periods.find((p) =>
        orderDate.toLocaleDateString(undefined, { month: "short", day: "numeric" }) === p
      );
      if (!periodKey) return;

      const existing = periodMap.get(periodKey);
      if (existing) {
        existing.totalSales += order.totalPrice;
        existing.itemCount += order.menuItems.reduce((sum, item) => sum + item.quantity, 0);
      }
    });

    return Array.from(periodMap.values());

  }, [orders, start, end]);


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
          Sales Over Time
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