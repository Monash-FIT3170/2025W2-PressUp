import React, { useEffect, useState, useMemo } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import {
  Order,
  OrderMenuItem,
  OrdersCollection,
} from "/imports/api/orders/OrdersCollection";
import { PopularItemsAnalysis } from "./components/PopularItemsAnalysis";
import { SalesTrendsVisualization } from "./components/SalesTrendsVisualization";
import { PeakHoursAnalysis } from "./components/PeakHoursAnalysis";
import { ExportButton } from "./components/ExportButton";
import {
  format,
  startOfToday,
  startOfWeek,
  startOfMonth,
  startOfYear,
  subDays,
} from "date-fns";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { FinanceDateFilter } from "../../components/FinanceDateFilter";

export const AnalyticsPage = () => {
  const [_, setPageTitle] = usePageTitle();

  const [dateRange, setDateRange] = useState<
    | "all"
    | "today"
    | "thisWeek"
    | "thisMonth"
    | "thisYear"
    | "past7Days"
    | "past30Days"
  >("all");
  const [currentDate, setCurrentDate] = useState(new Date());

  const [customDateRange] = useState<{
    start: Date;
    end: Date;
  } | null>(null);

  const [dateRangeBounds, setDateRangeBounds] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });

  // Subscribe to orders collection using the same pattern as OrderHistoryPage
  const orders: Order[] = useTracker(() => {
    const sub = Meteor.subscribe("orders");
    if (!sub.ready()) return [];
    const docs = OrdersCollection.find({}, { sort: { createdAt: -1 } }).fetch();
    console.log("Orders fetched in analytics:", docs.length);
    console.log("Sample order:", docs[0]);
    return docs;
  }, []);

  // Filter orders based on date range
  const ordersFiltered = useMemo(() => {
    if (!dateRangeBounds.start || !dateRangeBounds.end) {
      return orders;
    }

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= dateRangeBounds.start! && orderDate <= dateRangeBounds.end!;
    });
  }, [orders, dateRangeBounds]);

  const getDateRangeText = (_range: string) => {
    if (!dateRangeBounds.start || !dateRangeBounds.end) {
      return "All Time";
    }
    return `${format(dateRangeBounds.start, "MMM d, yyyy")} – ${format(
      dateRangeBounds.end,
      "MMM d, yyyy",
    )}`;
  };

  useEffect(() => {
    let start: Date | null = null;
    let end: Date | null = null;

    switch (dateRange) {
      case "today":
        start = startOfToday();
        end = new Date(); // Include all of today
        break;
      case "thisWeek":
        start = startOfWeek(currentDate, { weekStartsOn: 1 });
        end = new Date(); // Include up to now
        break;
      case "thisMonth":
        start = startOfMonth(currentDate);
        end = new Date(); // Include up to now
        break;
      case "thisYear":
        start = startOfYear(currentDate);
        end = new Date(); // Include up to now
        break;
      case "past7Days":
        start = subDays(new Date(), 6);
        end = new Date(); // Include up to now
        break;
      case "past30Days":
        start = subDays(new Date(), 29);
        end = new Date(); // Include up to now
        break;
      case "all":
      default:
        start = null;
        end = null;
    }

    setDateRangeBounds({ start, end });
  }, [dateRange, currentDate]);

  useEffect(() => {
    setPageTitle("Finance - Analytics & Reporting");
  }, [setPageTitle]);

  const convertToCSV = (objArray: Order[]) => {
    const array = objArray;

    const header = [
      "Order ID",
      "Order Number",
      "Number of Items",
      "Paid",
      "Order Status",
      "Order Date",
    ];
    let str = header.join(",") + "\r\n";

    for (const order of array) {
      const row = [
        order._id || "",
        order.orderNo || "",
        order.menuItems
          ? order.menuItems.reduce(
              (sum: number, item: OrderMenuItem) => sum + item.quantity,
              0,
            )
          : 0,
        order.paid ? "TRUE" : "FALSE",
        order.orderStatus || "",
        order.createdAt
          ? format(new Date(order.createdAt), "yyyy-MM-dd HH:mm:ss")
          : "",
      ];
      str += row.join(",") + "\r\n";
    }

    return str;
  };

  const downloadCSV = (data: Order[], fileName: string) => {
    const csvData = new Blob([convertToCSV(data)], { type: "text/csv" });
    const csvURL = URL.createObjectURL(csvData);
    const link = document.createElement("a");
    link.href = csvURL;
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    if (!dateRangeBounds.start || !dateRangeBounds.end) {
      downloadCSV(ordersFiltered, "CSV_Analytics_PressUp_All_Time");
      return;
    }
    const formattedStart = format(dateRangeBounds.start, "yyyy-MM-dd");
    const formattedEnd = format(dateRangeBounds.end, "yyyy-MM-dd");

    downloadCSV(
      ordersFiltered,
      `CSV_Analytics_PressUp_${formattedStart}_to_${formattedEnd}`,
    );
  };

  return (
    <div className="w-full p-6 bg-gray-50 max-h-screen overflow-y-auto">
      {/* Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <FinanceDateFilter
          range={dateRange}
          currentDate={currentDate}
          onRangeChange={(r) => {
            setDateRange(r);
            setCurrentDate(new Date());
          }}
          onDateChange={setCurrentDate}
        />
        <h2 className="text-lg lg:text-xl font-semibold text-press-up-washed-blue">
          Viewing Period:{" "}
          <span className="font-normal text-press-up-navy">
            {getDateRangeText(dateRange)}
          </span>
        </h2>
        <ExportButton onExport={handleExport} />
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <PopularItemsAnalysis
            orders={ordersFiltered}
            timeFrame={dateRange}
            customDateRange={customDateRange}
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <SalesTrendsVisualization
            orders={ordersFiltered}
            dateRangeBounds={dateRangeBounds}
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
          <PeakHoursAnalysis orders={ordersFiltered} timeFrame={dateRange} />
        </div>
      </div>
    </div>
  );
};
