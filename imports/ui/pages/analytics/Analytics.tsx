import React, { useEffect, useState } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { TransactionsCollection } from "/imports/api/transactions/TransactionsCollection";
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


  const { transactions, orders } = useTracker(() => {
    const transactionsHandle = Meteor.subscribe("transactions");
    const ordersHandle = Meteor.subscribe("orders");

    return {
      transactions: TransactionsCollection.find().fetch(),
      orders: OrdersCollection.find().fetch(),
      loading: !transactionsHandle.ready() || !ordersHandle.ready(),
    };
  });

  useEffect(() => {
    
    setPageTitle("Analytics & Reporting");
  }, [setPageTitle]);

  const handleCustomRangeChange = (startDate: Date, endDate: Date) => {
    setCustomDateRange({ start: startDate, end: endDate });
    console.log(transactions);
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
      downloadCSV(transactions, "CSV_Analytics_PressUp"); 
  }

  return (
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
        {/* Popular Items Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <PopularItemsAnalysis
            transactions={transactions}
            timeFrame={selectedTimeFrame}
            customDateRange={customDateRange}
          />
        </div>

        {/* Sales Trends Visualization */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <SalesTrendsVisualization
            transactions={transactions}
            timeFrame={selectedTimeFrame}
            customDateRange={customDateRange}
          />
        </div>

        {/* Peak Hours Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <PeakHoursAnalysis
            orders={orders}
            timeFrame={selectedTimeFrame}
            customDateRange={customDateRange}
          />
        </div>
      </div>
    </div>
  );
}; 