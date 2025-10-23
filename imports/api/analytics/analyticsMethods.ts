import { Meteor } from "meteor/meteor";
import { requireLoginMethod } from "../accounts/wrappers";
import { OrdersCollection } from "../orders/OrdersCollection";

Meteor.methods({
  "analytics.getPopularItems": requireLoginMethod(async function (
    _timeFrame: string,
    startDate: Date,
    endDate: Date,
  ) {
    const orders = await OrdersCollection.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
      paid: true, // Only include paid orders
    }).fetch();

    const itemMap = new Map<
      string,
      {
        name: string;
        totalQuantity: number;
        totalRevenue: number;
        averagePrice: number;
      }
    >();

    orders.forEach((order) => {
      order.menuItems.forEach((menuItem) => {
        const existing = itemMap.get(menuItem.name);
        if (existing) {
          existing.totalQuantity += menuItem.quantity;
          existing.totalRevenue += menuItem.quantity * menuItem.price;
          existing.averagePrice =
            existing.totalRevenue / existing.totalQuantity;
        } else {
          itemMap.set(menuItem.name, {
            name: menuItem.name,
            totalQuantity: menuItem.quantity,
            totalRevenue: menuItem.quantity * menuItem.price,
            averagePrice: menuItem.price,
          });
        }
      });
    });

    return Array.from(itemMap.values()).sort(
      (a, b) => b.totalQuantity - a.totalQuantity,
    );
  }),

  "analytics.getSalesTrends": requireLoginMethod(async function (
    timeFrame: string,
    startDate: Date,
    endDate: Date,
  ) {
    const orders = await OrdersCollection.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
      paid: true, // Only include paid orders
    }).fetch();

    // Group by time periods based on timeFrame
    const periodMap = new Map<
      string,
      {
        period: string;
        totalSales: number;
        itemCount: number;
      }
    >();

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      let period: string;

      switch (timeFrame) {
        case "day": {
          const hour = orderDate.getHours();
          if (hour < 4) period = "00-04";
          else if (hour < 8) period = "04-08";
          else if (hour < 12) period = "08-12";
          else if (hour < 16) period = "12-16";
          else if (hour < 20) period = "16-20";
          else period = "20-24";
          break;
        }
        case "week": {
          const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          period = days[orderDate.getDay()];
          break;
        }
        case "month": {
          const weekDiff = Math.floor(
            (Date.now() - orderDate.getTime()) / (7 * 24 * 60 * 60 * 1000),
          );
          period = `Week ${4 - weekDiff}`;
          break;
        }
        case "year": {
          const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          period = months[orderDate.getMonth()];
          break;
        }
        default: {
          period = "Unknown";
        }
      }

      const existing = periodMap.get(period);
      if (existing) {
        existing.totalSales += order.totalPrice;
        existing.itemCount += order.menuItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
      } else {
        periodMap.set(period, {
          period,
          totalSales: order.totalPrice,
          itemCount: order.menuItems.reduce(
            (sum, item) => sum + item.quantity,
            0,
          ),
        });
      }
    });

    return Array.from(periodMap.values());
  }),

  "analytics.getPeakHours": requireLoginMethod(async function (
    _timeFrame: string,
    startDate: Date,
    endDate: Date,
  ) {
    const orders = await OrdersCollection.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
      paid: true, // Only include paid orders
    }).fetch();

    // Initialize hourly data
    const hourlyMap = new Map<
      number,
      {
        hour: number;
        orderCount: number;
        totalRevenue: number;
      }
    >();
    for (let hour = 0; hour < 24; hour++) {
      hourlyMap.set(hour, { hour, orderCount: 0, totalRevenue: 0 });
    }

    // Aggregate data by hour
    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const hour = orderDate.getHours();
      const existing = hourlyMap.get(hour);
      if (existing) {
        existing.orderCount += 1;
        existing.totalRevenue += order.totalPrice;
      }
    });

    return Array.from(hourlyMap.values());
  }),

  "analytics.exportReport": requireLoginMethod(async function (
    format: string,
    timeFrame: string,
    startDate: Date,
    endDate: Date,
  ) {
    // This would implement actual export functionality
    // For now, return a summary of the data
    const orders = await OrdersCollection.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
      paid: true, // Only include paid orders
    }).fetch();

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalPrice,
      0,
    );
    const totalOrders = orders.length;
    const totalItems = orders.reduce(
      (sum, order) =>
        sum +
        order.menuItems.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    );

    return {
      format,
      timeFrame,
      startDate,
      endDate,
      summary: {
        totalRevenue,
        totalOrders,
        totalItems,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      },
      message: `${format.toUpperCase()} export functionality will be implemented here.`,
    };
  }),
});
