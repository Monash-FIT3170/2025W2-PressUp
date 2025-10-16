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
  timeFrame:
    | "all"
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
  customDateRange: _customDateRange,
}) => {
  const popularItems = useMemo(() => {
    const today = startOfToday();
    let startDate: Date | null = null;
    let endDate: Date | null = today;

    switch (timeFrame) {
      case "today":
        startDate = today;
        break;
      case "thisWeek":
        startDate = startOfWeek(today, { weekStartsOn: 1 });
        break;
      case "thisMonth":
        startDate = startOfMonth(today);
        break;
      case "thisYear":
        startDate = startOfYear(today);
        break;
      case "past7Days":
        startDate = subDays(today, 6);
        break;
      case "past30Days":
        startDate = subDays(today, 29);
        break;
      case "all":
      default:
        startDate = null;
        endDate = null;
    }

    const filteredorders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);

      if (!startDate || !endDate) {
        return true;
      }

      return orderDate >= startDate && orderDate <= endDate;
    });

    const itemMap = new Map<string, ItemStats>();

    filteredorders.forEach((order) => {
      if (!order.paid) {
        return;
      }
      order.menuItems.forEach((menuItem: OrderMenuItem) => {
        const existing = itemMap.get(menuItem.name);
        const revenue = menuItem.price * menuItem.quantity;

        if (existing) {
          existing.totalQuantity += menuItem.quantity;
          existing.totalRevenue += menuItem.quantity * menuItem.price;
          existing.averagePrice =
            existing.totalRevenue / existing.totalQuantity;
        } else {
          itemMap.set(menuItem.name, {
            name: menuItem.name,
            totalQuantity: menuItem.quantity,
            totalRevenue: revenue,
            averagePrice: menuItem.price,
          });
        }
      });
    });

    return Array.from(itemMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);
  }, [orders, timeFrame]);

  const overallMostPopular = useMemo<{ name: string; quantity: number }>(() => {
    const itemMap = new Map<string, number>();

    orders.forEach((order) => {
      if (!order.paid) return;

      order.menuItems.forEach((menuItem: OrderMenuItem) => {
        itemMap.set(
          menuItem.name,
          (itemMap.get(menuItem.name) || 0) + menuItem.quantity,
        );
      });
    });

    let mostPopular: { name: string; quantity: number } = {
      name: "",
      quantity: 0,
    };

    itemMap.forEach((quantity, name) => {
      if (quantity > mostPopular.quantity) {
        mostPopular = { name, quantity };
      }
    });

    // Debug logging
    console.log("Orders count:", orders.length);
    console.log("Paid orders:", orders.filter((o) => o.paid).length);
    console.log("Item map:", Array.from(itemMap.entries()));
    console.log("Most popular:", mostPopular);

    return mostPopular;
  }, [orders]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-press-up-navy">
        Popular Items Analysis
      </h2>

      {/* Summary */}
      <div className="bg-press-up-light-purple p-4 rounded-lg">
        <p className="text-sm text-press-up-navy">
          <span className="font-semibold">Overall Most Popular:</span>{" "}
          {overallMostPopular.name || "No data available"} (
          {overallMostPopular.quantity} units sold)
        </p>
        <p className="text-xs text-press-up-washed-blue mt-1">
          This data helps with stock ordering decisions
        </p>
      </div>

      {/* Popular Items List */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-press-up-washed-blue">
          Top Items ({timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)})
        </h3>

        {popularItems.length > 0 ? (
          <div className="space-y-2">
            {popularItems.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 bg-press-up-cream rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-press-up-purple text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-press-up-navy">
                      {item.name}
                    </p>
                    <p className="text-sm text-press-up-washed-blue">
                      ${item.averagePrice.toFixed(2)} avg price
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-press-up-navy">
                    {item.totalQuantity} sold
                  </p>
                  <p className="text-sm text-press-up-washed-blue">
                    ${item.totalRevenue.toFixed(2)} revenue
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-press-up-washed-blue text-center py-4">
            No data available for this time period
          </p>
        )}
      </div>
    </div>
  );
};
