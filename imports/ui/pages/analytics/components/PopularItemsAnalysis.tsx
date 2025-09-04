import React, { useMemo } from "react";
import { Order, OrderMenuItem } from "/imports/api/orders/OrdersCollection";
import {
  startOfToday,
  startOfWeek,
  startOfMonth,
  startOfYear,
  subDays,
} from "date-fns";

interface PopularItemsAnalysisProps {
  orders: Order[];
  timeFrame: "all"
    | "today"
    | "thisWeek"
    | "thisMonth"
    | "thisYear"
    | "past7Days"
    | "past30Days";
  customDateRange?: { start: Date; end: Date } | null;
}

interface ItemStats {
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  averagePrice: number;
}

export const PopularItemsAnalysis: React.FC<PopularItemsAnalysisProps> = ({
  orders,
  timeFrame,
  customDateRange,
}) => {
  const popularItems = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (timeFrame === "custom" && customDateRange) {
      startDate = customDateRange.start;
      endDate = customDateRange.end;
    } else {
      switch (timeFrame) {
        case "day":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
    }

    const filteredorders = orders.filter(
      (t) => {
        const transactionDate = new Date(t.createdAt);
        return transactionDate >= startDate && transactionDate <= endDate;
      }
    );

    const itemMap = new Map<string, ItemStats>();

    filteredorders.forEach((transaction) => {
      const existing = itemMap.get(transaction.name);
      if (existing) {
        existing.totalQuantity += transaction.quantity;
        existing.totalRevenue += transaction.quantity * transaction.price;
        existing.averagePrice = existing.totalRevenue / existing.totalQuantity;
      } else {
        itemMap.set(transaction.name, {
          name: transaction.name,
          totalQuantity: transaction.quantity,
          totalRevenue: transaction.quantity * transaction.price,
          averagePrice: transaction.price,
        });
      }
    });

    return Array.from(itemMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);
  }, [orders, timeFrame, customDateRange]);

  const overallMostPopular = useMemo(() => {
    const itemMap = new Map<string, number>();
    orders.forEach((t) => {
      itemMap.set(t.name, (itemMap.get(t.name) || 0) + t.quantity);
    });
    
    let mostPopular = { name: "", quantity: 0 };
    itemMap.forEach((quantity, name) => {
      if (quantity > mostPopular.quantity) {
        mostPopular = { name, quantity };
      }
    });
    
    return mostPopular;
  }, [orders]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Popular Items Analysis</h2>
      
      {/* Summary */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Overall Most Popular:</span> {overallMostPopular.name} 
          ({overallMostPopular.quantity} units sold)
        </p>
        <p className="text-xs text-blue-600 mt-1">
          This data helps with stock ordering decisions
        </p>
      </div>

      {/* Popular Items List */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-700">
          Top Items ({timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)})
        </h3>
        
        {popularItems.length > 0 ? (
          <div className="space-y-2">
            {popularItems.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-press-up-purple text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      ${item.averagePrice.toFixed(2)} avg price
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{item.totalQuantity} sold</p>
                  <p className="text-sm text-gray-500">
                    ${item.totalRevenue.toFixed(2)} revenue
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No data available for this time period</p>
        )}
      </div>
    </div>
  );
}; 