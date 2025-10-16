import React, { useEffect, useState, useMemo } from "react";
import { useSubscribe } from "meteor/react-meteor-data";
import { Order, OrdersCollection } from "/imports/api/orders/OrdersCollection";
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

  // Subscribe to orders collection
  const ordersReady = useSubscribe("orders");
  const orders = useMemo(() => {
    if (!ordersReady()) return [];
    return OrdersCollection.find().fetch();
  }, [ordersReady]);

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
    return `${format(dateRangeBounds.start, "dd/MM/yy")} – ${format(
      dateRangeBounds.end,
      "dd/MM/yy",
    )}`;
  };

  useEffect(() => {
    const today = startOfToday();
    let start: Date | null = null;
    let end: Date | null = today;

    switch (dateRange) {
      case "today":
        start = today;
        break;
      case "thisWeek":
        start = startOfWeek(today, { weekStartsOn: 1 });
        break;
      case "thisMonth":
        start = startOfMonth(today);
        break;
      case "thisYear":
        start = startOfYear(today);
        break;
      case "past7Days":
        start = subDays(today, 6);
        break;
      case "past30Days":
        start = subDays(today, 29);
        break;
      case "all":
      default:
        start = null;
        end = null;
    }

    setDateRangeBounds({ start, end });
  }, [dateRange]);

  useEffect(() => {
    setPageTitle("Analytics & Reporting");
  }, [setPageTitle]);

  const convertToCSV = (objArray: any) => {
    const array =
      typeof objArray !== "object" ? JSON.parse(objArray) : objArray;

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
              (sum: number, item: any) => sum + item.quantity,
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

  const downloadCSV = (data: any, fileName: string) => {
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
    <div className="min-h-screen w-full overflow-x-hidden overflow-y-auto scroll-smooth bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reporting</h1>
        <p className="text-gray-600">Comprehensive insights into your business performance</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <FinanceDateFilter range={dateRange} onRangeChange={setDateRange} />
        <h2 className="text-lg lg:text-xl font-semibold text-gray-700">
          Viewing Period:{" "}
          <span className="font-normal">{getDateRangeText(dateRange)}</span>
        </h2>
        <ExportButton onExport={handleExport} />
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <PopularItemsAnalysis
            orders={ordersFiltered}
            timeFrame={dateRange}
            customDateRange={customDateRange}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <SalesTrendsVisualization
            orders={ordersFiltered}
            dateRangeBounds={dateRangeBounds}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <PeakHoursAnalysis orders={ordersFiltered} timeFrame={dateRange} />
        </div>
      </div>
    </div>
  );
};
