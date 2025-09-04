import React, { useCallback, useEffect, useState } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Order, OrderMenuItem } from "/imports/api/orders/OrdersCollection";
import { OrdersCollection } from "/imports/api/orders/OrdersCollection";
import { PopularItemsAnalysis } from "./components/PopularItemsAnalysis";
import { SalesTrendsVisualization } from "./components/SalesTrendsVisualization";
import { PeakHoursAnalysis } from "./components/PeakHoursAnalysis";
import { ExportButton } from "./components/ExportButton";
import { DateRangeSelector } from "./components/DateRangeSelector";
import { Meteor } from "meteor/meteor";
import { usePageTitle } from "../../hooks/PageTitleContext";


export type TimeFrame = "day" | "week" | "month" | "year" | "custom";

export const AnalyticsPage = () => {

  // Set title
  const [_, setPageTitle] = usePageTitle();
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>("week");
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date } | null>(null);


  // const { orders } = useTracker(() => {
  //   const ordersHandle = Meteor.subscribe("orders");

  //   return {
  //     orders: OrdersCollection.find().fetch(),
  //   };
  // });
  const [ordersFiltered, setOrdersFiletered] = useState<Order[]>([]);

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
    // try {
    const now = new Date();
    let startDate: Date;

    switch (selectedTimeFrame) {
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
    }
    // TODO 
    // add a date and possible account name tage here
    downloadCSV(ordersFiltered, "CSV_Analytics_PressUp");
  }

  return (
    <div className="h-screen overflow-y-auto">
      <div className="flex flex-col space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-press-up-purple">Analytics & Reporting</h1>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            <DateRangeSelector
              timeFrame={selectedTimeFrame}
              onTimeFrameChange={setSelectedTimeFrame}
              onCustomRangeChange={handleCustomRangeChange}
            />
            <ExportButton onExport={handleExport} />
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ordersFiltered.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Popular Items Analysis */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <PopularItemsAnalysis
                  transactions={ordersFiltered}
                  timeFrame={selectedTimeFrame}
                  customDateRange={customDateRange}
                />
              </div>

              {/* Sales Trends Visualization */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <SalesTrendsVisualization
                  transactions={ordersFiltered}
                  timeFrame={selectedTimeFrame}
                  customDateRange={customDateRange}
                />
              </div>

              {/* Peak Hours Analysis */}
              <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                <PeakHoursAnalysis
                  orders={ordersFiltered}
                  timeFrame={selectedTimeFrame}
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