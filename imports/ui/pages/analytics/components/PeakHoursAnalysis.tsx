import React, { useMemo } from "react";
import { Order } from "/imports/api/orders/OrdersCollection";
import {
  startOfToday,
  startOfWeek,
  startOfMonth,
  startOfYear,
  subDays,
} from "date-fns";

interface PeakHoursAnalysisProps {
  orders: Order[];
  timeFrame:
    | "all"
    | "today"
    | "thisWeek"
    | "thisMonth"
    | "thisYear"
    | "past7Days"
    | "past30Days";
}

interface HourlyData {
  hour: number;
  orderCount: number;
  totalRevenue: number;
}

export const PeakHoursAnalysis: React.FC<PeakHoursAnalysisProps> = ({
  orders,
  timeFrame,
}) => {
  const hourlyData = useMemo<HourlyData[]>(() => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = now;

    switch (timeFrame) {
      case "today":
        startDate = startOfToday();
        break;
      case "thisWeek":
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        break;
      case "thisMonth":
        startDate = startOfMonth(now);
        break;
      case "thisYear":
        startDate = startOfYear(now);
        break;
      case "past7Days":
        startDate = subDays(now, 6);
        break;
      case "past30Days":
        startDate = subDays(now, 29);
        break;
      case "all":
      default:
        startDate = null;
        endDate = null;
    }

    const filteredOrders = orders.filter((o) => {
      const orderDate = new Date(o.createdAt);

      if (!o.paid) {
        return false;
      }

      if (startDate && endDate) {
        return orderDate >= startDate && orderDate <= endDate;
      }

      return true;
    });

    // Initialize hourly data
    const hourlyMap = new Map<number, HourlyData>();
    for (let hour = 0; hour < 24; hour++) {
      hourlyMap.set(hour, { hour, orderCount: 0, totalRevenue: 0 });
    }

    // Aggregate data by hour
    filteredOrders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const hour = orderDate.getHours();
      const existing = hourlyMap.get(hour);

      if (existing) {
        existing.orderCount += 1;
        existing.totalRevenue += order.totalPrice;
      }
    });

    return Array.from(hourlyMap.values());
  }, [orders, timeFrame]);

  const peakHour = useMemo(() => {
    return hourlyData.reduce(
      (peak, current) =>
        current.orderCount > peak.orderCount ? current : peak,
      { hour: 0, orderCount: 0, totalRevenue: 0 },
    );
  }, [hourlyData]);

  const maxOrders = Math.max(...hourlyData.map((d) => d.orderCount), 1);

  const formatHour = (hour: number) => {
    if (hour === 0) return "12 AM";
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return "12 PM";
    return `${hour - 12} PM`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-press-up-navy">
        Peak Hours Analysis
      </h2>

      {/* Summary */}
      <div className="bg-press-up-light-purple p-4 rounded-lg">
        {peakHour.orderCount > 0 ? (
          <p className="text-sm text-press-up-navy">
            <span className="font-semibold">Peak Hour:</span>{" "}
            {formatHour(peakHour.hour)}({peakHour.orderCount} orders)
          </p>
        ) : (
          <p className="text-sm text-press-up-navy">No peak hour data available</p>
        )}
        <p className="text-xs text-press-up-washed-blue mt-1">
          This data supports staff scheduling decisions
        </p>
      </div>

      {/* Chart */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-press-up-washed-blue">
          Customer Traffic Patterns (
          {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)})
        </h3>

        {hourlyData.some((d) => d.orderCount > 0) ? (
          <div className="relative">
            {/* SVG Chart */}
            <svg
              width="100%"
              height="250"
              className="border border-gray-200 rounded-lg bg-white"
            >
              {/* Grid lines */}
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio, i) => (
                <line
                  key={i}
                  x1="0"
                  y1={250 * ratio}
                  x2="100%"
                  y2={250 * ratio}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}

              {/* Hour labels */}
              {hourlyData.map((dataPoint, index) => {
                const x = (index * 100) / 24;
                return (
                  <text
                    key={`label-${dataPoint.hour}`}
                    x={`${x}%`}
                    y="240"
                    textAnchor="middle"
                    className="text-xs fill-gray-600"
                  >
                    {dataPoint.hour % 6 === 0 ? formatHour(dataPoint.hour) : ""}
                  </text>
                );
              })}

              {/* Line chart */}
              <polyline
                points={hourlyData
                  .map((dataPoint, index) => {
                    const x = (index * 100) / 24;
                    const y = 200 - (dataPoint.orderCount / maxOrders) * 180;
                    return `${x}%,${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {hourlyData.map((dataPoint, index) => {
                const x = (index * 100) / 24;
                const y = 200 - (dataPoint.orderCount / maxOrders) * 180;
                return (
                  <circle
                    key={`point-${dataPoint.hour}`}
                    cx={`${x}%`}
                    cy={y}
                    r="3"
                    fill="#8b5cf6"
                    stroke="white"
                    strokeWidth="2"
                  />
                );
              })}

              {/* Peak hour highlight */}
              {peakHour.orderCount > 0 && (
                <g>
                  <circle
                    cx={`${(peakHour.hour * 100) / 24}%`}
                    cy={200 - (peakHour.orderCount / maxOrders) * 180}
                    r="6"
                    fill="#f59e0b"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={`${(peakHour.hour * 100) / 24}%`}
                    y={200 - (peakHour.orderCount / maxOrders) * 180 - 15}
                    textAnchor="middle"
                    className="text-xs fill-orange-600 font-bold"
                  >
                    PEAK
                  </text>
                </g>
              )}
            </svg>

            {/* Legend */}
            <div className="flex justify-center mt-2 space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-3 h-3 bg-press-up-purple rounded-full"></div>
                <span>Orders per Hour</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Peak Hour</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No order data available for this time period
          </p>
        )}
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-press-up-cream p-4 rounded-lg">
          <h4 className="font-medium text-press-up-navy">Total Orders</h4>
          <p className="text-2xl font-bold text-press-up-purple">
            {hourlyData.reduce((sum, d) => sum + d.orderCount, 0)}
          </p>
        </div>
        <div className="bg-press-up-cream p-4 rounded-lg">
          <h4 className="font-medium text-press-up-navy">Total Revenue</h4>
          <p className="text-2xl font-bold text-press-up-positive-button">
            ${hourlyData.reduce((sum, d) => sum + d.totalRevenue, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-press-up-cream p-4 rounded-lg">
          <h4 className="font-medium text-press-up-navy">Average Order Value</h4>
          <p className="text-2xl font-bold text-press-up-blue">
            $
            {(
              hourlyData.reduce((sum, d) => sum + d.totalRevenue, 0) /
              Math.max(
                hourlyData.reduce((sum, d) => sum + d.orderCount, 0),
                1,
              )
            ).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};
