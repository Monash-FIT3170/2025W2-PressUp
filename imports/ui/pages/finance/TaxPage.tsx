import { Meteor } from "meteor/meteor";
import React, { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { FinanceCard } from "../../components/FinanceCard";
import { TaxDateFilter } from "../../components/TaxDateFilter";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { OrdersCollection } from "/imports/api/orders/OrdersCollection";
import { PurchaseOrdersCollection } from "/imports/api/purchaseOrders/PurchaseOrdersCollection";
import { Deduction, DeductionsCollection } from "/imports/api/tax/DeductionsCollection";
import { ShiftsCollection } from "/imports/api/shifts/ShiftsCollection";
import { EditDeductionModal } from "../../components/EditDeductionModal";
import {
  format,
  startOfToday,
  startOfMonth,
  startOfYear,
  endOfMonth,
  endOfYear,
  subMonths,
  addMonths,
  subYears,
  addYears,
} from "date-fns";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Label,
} from "recharts";

interface FinancialDataField {
  title: string;
  description: string;
  items: { label: string; amount: number }[];
  total: number;
}

// PAYG quarters
const getQuarterRange = (date: Date) => {
  const month = date.getMonth();
  const quarterStartMonth = Math.floor(month / 3) * 3;
  const start = new Date(date.getFullYear(), quarterStartMonth, 1);
  const end = new Date(date.getFullYear(), quarterStartMonth + 3, 0, 23, 59, 59);
  return { start, end };
};

export const TaxPage = () => {
  const [_, setPageTitle] = usePageTitle();
  const [selectedMetric, setSelectedMetric] = useState<"incomeTax" | "payrollTax" | "GSTCollected" | "GSTPaid">("incomeTax");
  const [deductionForm, setDeductionForm] = useState({
    name: "",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    amount: "",
  });
  const [searchDeduction, setSearchDeduction] = useState("");
  const [dateRange, setDateRange] = useState<"all" | "month" | "PAYG" | "year">("all");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDeduction, setSelectedDeduction] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useSubscribe("orders");
  useSubscribe("purchaseOrders");
  useSubscribe("deductions");
  useSubscribe("shifts.all");

  const getDateRange = () => {
    if (dateRange === "all") return { start: new Date(0), end: new Date() };
    if (dateRange === "month") return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
    if (dateRange === "year") return { start: startOfYear(currentDate), end: endOfYear(currentDate) };
    if (dateRange === "PAYG") return getQuarterRange(currentDate);
    return { start: new Date(0), end: new Date() };
  };

  const { start, end } = getDateRange();

  const getDateRangeText = () => {
    if (dateRange === "all") return "All Time";
    const { start, end } = getDateRange();
    return `${format(start, "dd/MM/yy")} – ${format(end, "dd/MM/yy")}`;
  };

  // Fetch data
  const { orders, purchaseOrders, allDeductions, shifts } = useTracker(() => ({
    orders: OrdersCollection.find().fetch(),
    purchaseOrders: PurchaseOrdersCollection.find().fetch(),
    allDeductions: DeductionsCollection.find().fetch(),
    shifts: ShiftsCollection.find().fetch(),
  }), [dateRange, currentDate]);

  // Filter data by date
  const filteredOrders = orders.filter(o => new Date(o.createdAt) >= start && new Date(o.createdAt) <= end && o.paid);
  const filteredPurchaseOrders = purchaseOrders.filter(p => (p.date instanceof Date ? p.date : new Date(p.date)) >= start && (p.date instanceof Date ? p.date : new Date(p.date)) <= end);
  const filteredDeductions = allDeductions.filter(d => (d.date instanceof Date ? d.date : new Date(d.date)) >= start && (d.date instanceof Date ? d.date : new Date(d.date)) <= end);
  const filteredShifts = shifts.filter(s => (s.date instanceof Date ? s.date : new Date(s.date)) >= start && (s.date instanceof Date ? s.date : new Date(s.date)) <= end);

  // GST calculations
  let GSTTotal = 0, profitTotal = 0;
  const GSTByDate: Record<string, number> = {};
  filteredOrders.forEach(o => {
    const dateKey = format(new Date(o.createdAt), dateRange === "year" ? "MMM" : "dd/MM");
    o.menuItems.forEach(item => {
      const amount = item.price * item.quantity;
      const gst = amount / 11;
      GSTTotal += gst;
      profitTotal += amount;
      GSTByDate[dateKey] = (GSTByDate[dateKey] || 0) + gst;
    });
  });
  const GSTItems = Object.entries(GSTByDate).map(([label, amount]) => ({ label, amount }));

  let GSTexpenses = 0, expensesTotal = 0;
  const expensesByDate: Record<string, number> = {};
  filteredPurchaseOrders.forEach(p => {
    const amount = p.totalCost;
    const gst = amount / 11;
    GSTexpenses += gst;
    expensesTotal += amount;
    const dateKey = format(p.date instanceof Date ? p.date : new Date(p.date), dateRange === "year" ? "MMM" : "dd/MM");
    expensesByDate[dateKey] = (expensesByDate[dateKey] || 0) + gst;
  });
  const expenseItems = Object.entries(expensesByDate).map(([label, amount]) => ({ label, amount }));

  let deductionsTotal = 0;
  filteredDeductions.forEach(d => deductionsTotal += Number(d.amount));

  // Payroll tax and taxable income
  const [payrollTax, setPayrollTax] = useState(0);
  const [taxableIncome, setTaxableIncome] = useState(0);
  const [payrollItems, setPayrollItems] = useState<{ label: string; amount: number }[]>([]);

  useEffect(() => {
    (async () => {
      let payTotal = 0;
      const payByDate: Record<string, number> = {};
      for (const s of filteredShifts) {
        const pay = Number(await Meteor.callAsync("shifts.getPayForShift", s._id) ?? 0);
        const tax = pay * 0.0485;
        payTotal += pay;
        const dateKey = format(s.date instanceof Date ? s.date : new Date(s.date), dateRange === "year" ? "MMM" : "dd/MM");
        payByDate[dateKey] = (payByDate[dateKey] || 0) + tax;
      }
      setPayrollTax(payTotal * 0.0485);
      setPayrollItems(Object.entries(payByDate).map(([label, amount]) => ({ label, amount })));
      const income = profitTotal - expensesTotal - deductionsTotal - payTotal;
      setTaxableIncome(income > 0 ? income : 0);
    })();
  }, [filteredShifts, profitTotal, expensesTotal, deductionsTotal, dateRange]);

  const financialData: Record<string, FinancialDataField> = {
    incomeTax: { title: "Taxable Income", description: "Profit minus business deductions", items: [], total: taxableIncome },
    payrollTax: { title: "Payroll Tax", description: "Tax collected on wages paid", items: payrollItems, total: payrollTax },
    GSTCollected: { title: "GST Collected", description: "Goods and Services Tax collected on orders", items: GSTItems, total: GSTTotal },
    GSTPaid: { title: "GST Paid", description: "Goods and Services Tax paid on stock orders", items: expenseItems, total: GSTexpenses },
  };

  useEffect(() => { setPageTitle("Finance - Tax Management"); }, [setPageTitle]);

  const mainMetrics = [
    { key: "incomeTax", title: "Taxable Income", amount: financialData.incomeTax.total },
    { key: "payrollTax", title: "Payroll Tax", amount: financialData.payrollTax.total },
    { key: "GSTCollected", title: "Total GST Collected", amount: financialData.GSTCollected.total },
    { key: "GSTPaid", title: "Total GST Paid", amount: financialData.GSTPaid.total },
  ] as const;

  const currentData = financialData[selectedMetric];

  const combinedItems = (() => {
    const collectedMap = Object.fromEntries(financialData.GSTCollected.items.map(i => [i.label, i.amount]));
    const paidMap = Object.fromEntries(financialData.GSTPaid.items.map(i => [i.label, i.amount]));
    const allLabels = Array.from(new Set([...financialData.GSTCollected.items.map(i => i.label), ...financialData.GSTPaid.items.map(i => i.label)]));
    return allLabels.map(label => ({ label, collected: collectedMap[label] || 0, paid: paidMap[label] || 0 }));
  })();

  const filteredDeductionList = filteredDeductions.filter(d =>
    d.name.toLowerCase().includes(searchDeduction.toLowerCase())
  );

  const handleAddDeduction = (e: React.FormEvent) => {
    e.preventDefault();
    Meteor.call("deductions.add", {
      name: deductionForm.name,
      date: new Date(deductionForm.date),
      description: deductionForm.description,
      amount: parseFloat(deductionForm.amount),
    });
    setDeductionForm({ name: "", date: format(new Date(), "yyyy-MM-dd"), description: "", amount: "" });
  };

  const handleSave = async () => {
    setIsModalOpen(false);
    setSelectedDeduction(null);
  };

  return (
    <div className="flex flex-col flex-1 overflow-y-auto max-h-screen pb-10">
      <div className="w-full p-6 bg-gray-50 min-h-[100vh]">
        <div className="flex items-baseline gap-4 mb-4">
          <TaxDateFilter
            range={dateRange}
            currentDate={currentDate}
            onRangeChange={r => { setDateRange(r); setCurrentDate(new Date()); }}
            onDateChange={setCurrentDate}
          />
          <h2 className="ml-4 text-red-900">
            <span className="font-bold">Viewing Period:</span>{" "}
            <span className="font-normal">{getDateRangeText()}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {mainMetrics.map(metric => (
            <FinanceCard
              key={metric.key}
              title={metric.title}
              amount={metric.amount}
              isSelected={selectedMetric === metric.key}
              onClick={() => setSelectedMetric(metric.key)}
            />
          ))}
        </div>

        {/* descriptions where needed */}
        {selectedMetric === "incomeTax" && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-l text-gray-900 mb-4">
              Taxable income is calculated by subtracting wages and deductions from profits.
              Wages are calculated from shifts logged in Staff Management - Roster.
              If there is no profit for the given time period, taxable income will display as $0.00
            </h3>
          </div>
        )}
        {selectedMetric === "payrollTax" && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-l text-gray-900 mb-4">
              Monthly threshhold for payroll tax is $83,333.
              Annual threshhold for payroll tax is $1,000,000.
              If your business does not pay over that in wages then you do not have to pay payroll tax.
            </h3>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Deduction Form or GST Chart */}
          {selectedMetric === "incomeTax" && (
            <div className="bg-pink-100 rounded-xl shadow-lg p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Deduction</h2>
                <p className="text-gray-600">Enter business operation related expenses as tax deductions</p>
              </div>
              <form onSubmit={handleAddDeduction} className="space-y-4">
                <input type="text" placeholder="Deduction Name" value={deductionForm.name}
                  onChange={e => setDeductionForm({ ...deductionForm, name: e.target.value })}
                  className="w-full p-2 border bg-white rounded-lg" required />
                <input type="date" value={deductionForm.date}
                  onChange={e => setDeductionForm({ ...deductionForm, date: e.target.value })}
                  className="w-full p-2 border bg-white rounded-lg" required />
                <input type="number" placeholder="Amount" value={deductionForm.amount}
                  onChange={e => setDeductionForm({ ...deductionForm, amount: e.target.value })}
                  className="w-full p-2 border bg-white rounded-lg" required />
                <textarea placeholder="Description" value={deductionForm.description}
                  onChange={e => setDeductionForm({ ...deductionForm, description: e.target.value })}
                  className="w-full p-2 border bg-white rounded-lg" />
                <button type="submit" className="px-4 py-2 bg-press-up-purple text-white rounded">Add Deduction</button>
              </form>
            </div>
          )}

          {(selectedMetric === "GSTCollected" || selectedMetric === "GSTPaid" || selectedMetric === "payrollTax") && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{financialData[selectedMetric].title}</h2>
                <p className="text-gray-600">{financialData[selectedMetric].description}</p>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer>
                  <BarChart data={financialData[selectedMetric].items}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label"><Label value="Date" offset={-5} position="insideBottom" /></XAxis>
                    <YAxis><Label value="Amount ($)" angle={-90} position="insideLeft" style={{ textAnchor: "middle" }} /></YAxis>
                    <Tooltip />
                    <Bar dataKey="amount" fill="#c6b6cf" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Right: Deduction List or GST Comparison */}
          <div className="space-y-6">
            {selectedMetric === "incomeTax" && (
              <div className="w-full bg-pink-100 rounded-xl shadow-lg p-6">
                <input type="text" placeholder="Search deductions" value={searchDeduction}
                  onChange={e => setSearchDeduction(e.target.value)}
                  className="w-1/2 px-4 py-2 bg-white rounded-lg border border-black focus:outline-none focus:ring-2 focus:ring-purple-400 mb-4" />
                <div className="max-h-72 overflow-y-auto space-y-2">
                  {filteredDeductionList.length === 0 ? (
                    <p className="text-gray-600">No deductions found.</p>
                  ) : filteredDeductionList.map(d => (
                    <button
                      key={d._id}
                      onClick={() => {
                        setSelectedDeduction(d);
                        setIsModalOpen(true);
                      }
                      }
                      className="w-full text-left p-3 bg-white rounded-lg border border-black flex justify-between hover:bg-gray-100"
                    >
                      <div>
                        <p className="font-bold">{d.name} - {format(new Date(d.date), "dd/MM/yy")}</p>
                        <p className="text-sm text-gray-600">{d.description}</p>
                      </div>
                      <span className="font-semibold text-lg">${d.amount}</span>
                    </button>
                  ))}
                  <EditDeductionModal
                    isOpen={isModalOpen}
                    onClose={() => {
                      setIsModalOpen(false);
                      setSelectedDeduction(null);
                    }}
                    deduction={selectedDeduction}
                    onSave={handleSave}
                  />
                </div>
              </div>
            )}

            {(selectedMetric === "GSTCollected" || selectedMetric === "GSTPaid") && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">GST Paid vs GST Collected</h2>
                  <p className="text-gray-600">Comparison of Goods and Services Tax Collected and Paid</p>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer>
                    <BarChart data={combinedItems}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label"><Label value="Date" offset={-5} position="insideBottom" /></XAxis>
                      <YAxis><Label value="GST ($)" angle={-90} position="insideLeft" style={{ textAnchor: "middle" }} /></YAxis>
                      <Tooltip />
                      <Bar dataKey="collected" fill="#6f597b" name="GST Collected" />
                      <Bar dataKey="paid" fill="#c6b6cf" name="GST Paid" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
