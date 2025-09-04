import React, { useCallback, useEffect, useState } from "react";
import { useSubscribe } from "meteor/react-meteor-data";
import { Order, OrderMenuItem } from "/imports/api/orders/OrdersCollection";
import { OrdersCollection } from "/imports/api/orders/OrdersCollection";
import { PopularItemsAnalysis } from "./components/PopularItemsAnalysis";
import { SalesTrendsVisualization } from "./components/SalesTrendsVisualization";
import { PeakHoursAnalysis } from "./components/PeakHoursAnalysis";
import { ExportButton } from "./components/ExportButton";
import { DateRangeSelector } from "./components/DateRangeSelector";
import { Meteor } from "meteor/meteor";
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

  const [dateRange, setDateRange] = React.useState<
    | "all"
    | "today"
    | "thisWeek"
    | "thisMonth"
    | "thisYear"
    | "past7Days"
    | "past30Days"
  >("all");

  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [ordersFiltered, setOrdersFiletered] = useState<Order[]>([]);
  const [dateRangeBounds, setDateRangeBounds] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  useSubscribe("orders");

  const getDateRangeText = (range: typeof dateRange): string => {
    const today = startOfToday();
    
    let start: Date | null = null;
    let end: Date | null = today;

    switch (range) {
      case "today":
        start = today;
        break;
      case "thisWeek":
        start = startOfWeek(today, { weekStartsOn: 1 }); // Monday
        break;
      case "thisMonth":
        start = startOfMonth(today);
        break;
      case "thisYear":
        start = startOfYear(today);
        break;
      case "past7Days":
        start = subDays(today, 6); // 6 days ago + today = 7
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

    if (!start || !end) {
      return "All Time";
    }
    return `${format(start, "dd/MM/yy")} – ${format(end, "dd/MM/yy")}`;
  };


  useEffect(() => {

    setPageTitle("Analytics & Reporting");

    const fetchOrders = async () => {
      try {
        //const dateFilter = getDateRangeFilter(dateRange);

        const orderData = (await Meteor.callAsync("orders.getAll")) as Order[];
        setOrdersFiletered(orderData);

        // // Filter the data based on date range
        // setOrdersFiletered(orderData.filter((order) => {
        //   const orderDate = new Date(order.createdAt);
        //   return dateFilter(orderDate);
        // }))

      } catch (error) {
        console.error("Error fetching order data", error);
      }
    };
    fetchOrders();
  }, [setPageTitle, dateRange]);

const handleCustomRangeChange = (startDate: Date, endDate: Date) => {
    setCustomDateRange({ start: startDate, end: endDate });
    setDateRangeBounds({ start: startDate, end: endDate });   //sync with global state
  };

  const convertToCSV = (objArray: string) => {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';

    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (let index in array[i]) {
        if (line !== '') line += ',';

        line += array[i][index];
      }
      str += line + '\r\n';
    }
    return str;
  };

  const processOrderData = useCallback(
    (
      orders: Order[],
    ): {
      revenue: number;
      revenueItems: { label: string; amount: number; percentage: number }[];
    } => {
      const revenueByCat: { [key: string]: number } = {};

      let totalRevenue = 0;

      orders.forEach((order) => {
        if (!order.paid) return;

        let orderRevenue = 0;

        order.menuItems.forEach((menuItem: OrderMenuItem) => {
          const itemRevenue = menuItem.price * menuItem.quantity;

          orderRevenue += itemRevenue; // prevents double counting

          const categories =
            menuItem.category && menuItem.category.length > 0
              ? menuItem.category
              : ["uncategorized"];

          categories.forEach((category: string) => {
            revenueByCat[category] =
              (revenueByCat[category] || 0) + itemRevenue;
          });
        });
        totalRevenue += orderRevenue;
      });

      const revenueItems = Object.keys(revenueByCat).map((category) => ({
        label: category,
        amount: revenueByCat[category],
        percentage: (revenueByCat[category] / totalRevenue) * 100,
      }));

      return { revenue: totalRevenue, revenueItems };
    },
    [],
  );


  const downloadCSV = (data: any, fileName: any) => {
    //TODO
    // need to add a top row with column names. 
    // may also need to tidy up data.
    const csvData = new Blob([convertToCSV(data)], { type: 'text/csv' });
    const csvURL = URL.createObjectURL(csvData);
    const link = document.createElement('a');
    link.href = csvURL;
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async () => {
    if (!dateRangeBounds.start || !dateRangeBounds.end) {
      downloadCSV(ordersFiltered, "CSV_Analytics_PressUp_All_Time");
      return;
    }
    const formattedStart = format(dateRangeBounds.start, "yyyy-MM-dd");
    const formattedEnd = format(dateRangeBounds.end, "yyyy-MM-dd");

    downloadCSV(ordersFiltered, `CSV_Analytics_PressUp_${formattedStart}_to_${formattedEnd}`);
  }

  return (
    <div className="h-screen overflow-y-auto">
      <div className="flex flex-col space-y-6 p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-baseline gap-4">
            <FinanceDateFilter range={dateRange} onRangeChange={setDateRange} />
            <h2 className="ml-4 text-red-900">
              <span className="font-bold">Viewing Period:</span>{" "}
              <span className="font-normal">{getDateRangeText(dateRange)}</span>
            </h2>
          </div>

          <ExportButton onExport={handleExport} />

        </div>


        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ordersFiltered.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Popular Items Analysis */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <PopularItemsAnalysis
                  transactions={ordersFiltered}
                  timeFrame={dateRange}
                  customDateRange={customDateRange}
                />
              </div>

              {/* Sales Trends Visualization */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <SalesTrendsVisualization
                  transactions={ordersFiltered}
                  timeFrame={dateRange}
                  customDateRange={customDateRange}
                />
              </div>

              {/* Peak Hours Analysis */}
              <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                <PeakHoursAnalysis
                  orders={ordersFiltered}
                  timeFrame={dateRange}
                  customDateRange={customDateRange}
                />
              </div>
            </div>
          ) : (
            <div>Loading data...</div>
          )}
        </div>
      </div>
    </div>
  );
}; 