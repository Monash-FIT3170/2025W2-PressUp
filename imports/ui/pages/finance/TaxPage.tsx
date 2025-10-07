import { Meteor } from "meteor/meteor";
import React, { useState, useEffect, useMemo } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { FinanceCard } from "../../components/FinanceCard";
import { TaxDateFilter } from "../../components/TaxDateFilter";
import { EditDeductionModal } from "../../components/EditDeductionModal";
import {
  format,
  startOfMonth,
  startOfYear,
  endOfMonth,
  endOfYear,
  endOfDay,
} from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Trash } from "lucide-react";
import { ConfirmModal } from "../../components/ConfirmModal";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { DeductionsCollection } from "/imports/api/tax/DeductionsCollection";

interface FinancialDataField {
  title: string;
  description: string;
  items: { label: string; amount: number }[];
  total: number;
}

// PAYG quarters helper
const getQuarterRange = (date: Date) => {
  const month = date.getMonth();
  const quarterStartMonth = Math.floor(month / 3) * 3;
  const start = new Date(date.getFullYear(), quarterStartMonth, 1);
  const end = new Date(
    date.getFullYear(),
    quarterStartMonth + 3,
    0,
    23,
    59,
    59,
  );
  return { start, end };
};

export const TaxPage = () => {
  const [_, setPageTitle] = usePageTitle();
  useSubscribe("deductions");
  const deductions = useTracker(() => DeductionsCollection.find().fetch());

  const [selectedMetric, setSelectedMetric] = useState<
    "incomeTax" | "payrollTax" | "GSTCollected" | "GSTPaid"
  >("incomeTax");
  const [deductionForm, setDeductionForm] = useState({
    name: "",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    amount: "",
  });
  const [searchDeduction, setSearchDeduction] = useState("");
  const [dateRange, setDateRange] = useState<"all" | "month" | "PAYG" | "year">(
    "all",
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDeduction, setSelectedDeduction] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data once
  const [orders, setOrders] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);

  useEffect(() => {
    setPageTitle("Finance - Tax Management");
    const fetchData = async () => {
      const fetchedOrders = (await Meteor.callAsync("orders.getAll")) as any[];
      const fetchedPOs = (await Meteor.callAsync(
        "purchaseOrders.getAll",
      )) as any[];
      const fetchedShifts = (await Meteor.callAsync("shifts.getAll")) as any[];
      setOrders(fetchedOrders);
      setPurchaseOrders(fetchedPOs);
      setShifts(fetchedShifts);
    };
    fetchData();
  }, [setPageTitle]);

  // Compute date range
  const { start, end } = useMemo(() => {
    if (dateRange === "all")
      return { start: new Date(0), end: endOfDay(new Date()) };
    if (dateRange === "month")
      return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
    if (dateRange === "year")
      return { start: startOfYear(currentDate), end: endOfYear(currentDate) };
    if (dateRange === "PAYG") return getQuarterRange(currentDate);
    return { start: new Date(0), end: endOfDay(new Date()) };
  }, [dateRange, currentDate]);

  const getDateRangeText = useMemo(() => {
    if (dateRange === "all") return "All Time";
    return `${format(start, "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")}`;
  }, [start, end, dateRange]);

  // Filter data by date
  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          new Date(o.createdAt) >= start &&
          new Date(o.createdAt) <= end &&
          o.paid,
      ),
    [orders, start, end],
  );
  const filteredPurchaseOrders = useMemo(
    () =>
      purchaseOrders.filter(
        (p) =>
          (p.date instanceof Date ? p.date : new Date(p.date)) >= start &&
          (p.date instanceof Date ? p.date : new Date(p.date)) <= end,
      ),
    [purchaseOrders, start, end],
  );
  const filteredDeductions = useMemo(
    () =>
      deductions.filter(
        (d) =>
          (d.date instanceof Date ? d.date : new Date(d.date)) >= start &&
          (d.date instanceof Date ? d.date : new Date(d.date)) <= end,
      ),
    [deductions, start, end],
  );
  const filteredShifts = useMemo(
    () =>
      shifts.filter(
        (s) =>
          (s.date instanceof Date ? s.date : new Date(s.date)) >= start &&
          (s.date instanceof Date ? s.date : new Date(s.date)) <= end,
      ),
    [shifts, start, end],
  );

  // GST calculations
  const {
    GSTTotal,
    GSTItems,
    GSTExpenses,
    expenseItems,
    profitTotal,
    expensesTotal,
    deductionsTotal,
  } = useMemo(() => {
    let GSTTotal = 0,
      profitTotal = 0,
      GSTExpenses = 0,
      expensesTotal = 0,
      deductionsTotal = 0;
    const GSTByDate: Record<string, number> = {};
    const expensesByDate: Record<string, number> = {};

    filteredOrders.forEach((o) => {
      const dateKey = format(
        new Date(o.createdAt),
        dateRange === "year" ? "MMM" : "dd/MM",
      );
      o.menuItems.forEach((item: { price: number; quantity: number }) => {
        const amount = item.price * item.quantity;
        const gst = amount / 11;
        GSTTotal += gst;
        profitTotal += amount;
        GSTByDate[dateKey] = (GSTByDate[dateKey] || 0) + gst;
      });
    });

    filteredPurchaseOrders.forEach((p) => {
      const amount = p.totalCost;
      const gst = amount / 11;
      GSTExpenses += gst;
      expensesTotal += amount;
      const dateKey = format(
        p.date instanceof Date ? p.date : new Date(p.date),
        dateRange === "year" ? "MMM" : "dd/MM",
      );
      expensesByDate[dateKey] = (expensesByDate[dateKey] || 0) + gst;
    });

    filteredDeductions.forEach((d) => (deductionsTotal += Number(d.amount)));

    return {
      GSTTotal,
      GSTItems: Object.entries(GSTByDate).map(([label, amount]) => ({
        label,
        amount,
      })),
      GSTExpenses,
      expenseItems: Object.entries(expensesByDate).map(([label, amount]) => ({
        label,
        amount,
      })),
      profitTotal,
      expensesTotal,
      deductionsTotal,
    };
  }, [filteredOrders, filteredPurchaseOrders, filteredDeductions, dateRange]);

  // Payroll tax and taxable income
  const [payrollTax, setPayrollTax] = useState(0);
  const [taxableIncome, setTaxableIncome] = useState(0);
  const [payrollItems, setPayrollItems] = useState<
    { label: string; amount: number }[]
  >([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      let payTotal = 0;
      const payByDate: Record<string, number> = {};
      for (const s of filteredShifts) {
        const pay = Number(
          (await Meteor.callAsync("shifts.getPayForShift", s._id)) ?? 0,
        );
        const tax = pay * 0.0485;
        payTotal += pay;
        const dateKey = format(
          s.date instanceof Date ? s.date : new Date(s.date),
          dateRange === "year" ? "MMM" : "dd/MM",
        );
        payByDate[dateKey] = (payByDate[dateKey] || 0) + tax;
      }
      if (!isMounted) return;
      setPayrollTax(payTotal * 0.0485);
      setPayrollItems(
        Object.entries(payByDate).map(([label, amount]) => ({ label, amount })),
      );
      const income = profitTotal - expensesTotal - deductionsTotal - payTotal;
      setTaxableIncome(income > 0 ? income : 0);
    })();
    return () => {
      isMounted = false;
    };
  }, [filteredShifts, profitTotal, expensesTotal, deductionsTotal, dateRange]);

  const financialData: Record<string, FinancialDataField> = {
    incomeTax: {
      title: "Taxable Income",
      description: "Profit minus business deductions",
      items: [],
      total: taxableIncome,
    },
    payrollTax: {
      title: "Payroll Tax",
      description: "Tax collected on wages paid",
      items: payrollItems,
      total: payrollTax,
    },
    GSTCollected: {
      title: "GST Collected",
      description: "Goods and Services Tax collected on orders",
      items: GSTItems,
      total: GSTTotal,
    },
    GSTPaid: {
      title: "GST Paid",
      description: "Goods and Services Tax paid on stock orders",
      items: expenseItems,
      total: GSTExpenses,
    },
  };

  const mainMetrics = useMemo(
    () => [
      {
        key: "incomeTax",
        title: "Taxable Income",
        amount: financialData.incomeTax.total,
      },
      {
        key: "payrollTax",
        title: "Payroll Tax",
        amount: financialData.payrollTax.total,
      },
      {
        key: "GSTCollected",
        title: "Total GST Collected",
        amount: financialData.GSTCollected.total,
      },
      {
        key: "GSTPaid",
        title: "Total GST Paid",
        amount: financialData.GSTPaid.total,
      },
    ],
    [financialData],
  );

  const currentData = financialData[selectedMetric];

  const combinedItems = useMemo(() => {
    const collectedMap = Object.fromEntries(
      financialData.GSTCollected.items.map((i) => [i.label, i.amount]),
    );
    const paidMap = Object.fromEntries(
      financialData.GSTPaid.items.map((i) => [i.label, i.amount]),
    );
    const allLabels = Array.from(
      new Set([
        ...financialData.GSTCollected.items.map((i) => i.label),
        ...financialData.GSTPaid.items.map((i) => i.label),
      ]),
    );
    return allLabels.map((label) => ({
      label,
      collected: collectedMap[label] || 0,
      paid: paidMap[label] || 0,
    }));
  }, [financialData]);

  const filteredDeductionList = useMemo(
    () =>
      filteredDeductions.filter((d) =>
        d.name.toLowerCase().includes(searchDeduction.toLowerCase()),
      ),
    [filteredDeductions, searchDeduction],
  );

  const handleAddDeduction = (e: React.FormEvent) => {
    e.preventDefault();
    Meteor.call("deductions.add", {
      name: deductionForm.name,
      date: new Date(deductionForm.date),
      description: deductionForm.description,
      amount: parseFloat(deductionForm.amount),
    });
    setDeductionForm({
      name: "",
      date: format(new Date(), "yyyy-MM-dd"),
      description: "",
      amount: "",
    });
  };

  const [showConfirm, setShowConfirm] = useState(false);
  const [deductionToDelete, setDeductionToDelete] = useState<string | null>(
    null,
  );

  // when bin icon is clicked
  const handleDeleteDeduction = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeductionToDelete(id);
    setShowConfirm(true);
  };

  // confirmation modal
  const handleConfirm = () => {
    if (!deductionToDelete) return;

    Meteor.call(
      "deductions.delete",
      deductionToDelete,
      (err: Meteor.Error | undefined) => {
        if (err) {
          alert(`Delete failed: ${err.reason}`);
        }
      },
    );

    setShowConfirm(false);
    setDeductionToDelete(null);
  };

  const handleSave = () => {
    setIsModalOpen(false);
    setSelectedDeduction(null);
  };

  if (!orders.length) {
    return (
      <div className="w-full p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto max-h-screen pb-10">
      <div className="w-full p-6 bg-gray-50 min-h-[100vh]">
        {/* Date Filter */}
        <div className="flex items-baseline gap-4 mb-4">
          <TaxDateFilter
            range={dateRange}
            currentDate={currentDate}
            onRangeChange={(r) => {
              setDateRange(r);
              setCurrentDate(new Date());
            }}
            onDateChange={setCurrentDate}
          />
          <h2 className="ml-4 text-red-900">
            <span className="font-semibold text-lg">
              Viewing Period: {getDateRangeText}
            </span>
          </h2>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {mainMetrics.map((metric) => (
            <FinanceCard
              key={metric.key}
              title={metric.title}
              amount={metric.amount}
              isSelected={selectedMetric === metric.key}
              onClick={() =>
                setSelectedMetric(
                  metric.key as
                    | "incomeTax"
                    | "payrollTax"
                    | "GSTCollected"
                    | "GSTPaid",
                )
              }
            />
          ))}
        </div>

        {/* descriptions where needed */}
        {selectedMetric === "incomeTax" && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-l text-gray-900 mb-4">
              Taxable income is calculated by subtracting wages and deductions
              from profits. Wages are calculated from shifts logged in Staff
              Management - Roster. If there is no profit for the given time
              period, taxable income will display as $0.00
            </h3>
          </div>
        )}
        {selectedMetric === "payrollTax" && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-l text-gray-900 mb-4">
              Monthly threshhold for payroll tax is $83,333. Annual threshhold
              for payroll tax is $1,000,000. If your business does not pay over
              that in wages then you do not have to pay payroll tax.
            </h3>
          </div>
        )}

        {/* Charts and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          {selectedMetric === "incomeTax" && (
            <div className="bg-pink-100 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Add Deduction
              </h2>
              <form onSubmit={handleAddDeduction} className="space-y-4">
                <input
                  type="text"
                  placeholder="Deduction Name"
                  value={deductionForm.name}
                  onChange={(e) =>
                    setDeductionForm({ ...deductionForm, name: e.target.value })
                  }
                  className="w-full p-2 border bg-white rounded-lg"
                  required
                />
                <input
                  type="date"
                  value={deductionForm.date}
                  onChange={(e) =>
                    setDeductionForm({ ...deductionForm, date: e.target.value })
                  }
                  className="w-full p-2 border bg-white rounded-lg"
                  required
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={deductionForm.amount}
                  onChange={(e) =>
                    setDeductionForm({
                      ...deductionForm,
                      amount: e.target.value,
                    })
                  }
                  className="w-full p-2 border bg-white rounded-lg"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={deductionForm.description}
                  onChange={(e) =>
                    setDeductionForm({
                      ...deductionForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-2 border bg-white rounded-lg"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-press-up-purple text-white rounded"
                >
                  Add Deduction
                </button>
              </form>
            </div>
          )}

          {(selectedMetric === "GSTCollected" ||
            selectedMetric === "GSTPaid" ||
            selectedMetric === "payrollTax") && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {currentData.title}
              </h2>
              <p className="text-gray-600 mb-4">{currentData.description}</p>
              <div className="h-80 w-full">
                <ResponsiveContainer>
                  <BarChart data={currentData.items}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="amount"
                      fill="#c6b6cf"
                      name={currentData.title}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Right Column */}
          {selectedMetric === "incomeTax" && (
            <div className="w-full bg-pink-100 rounded-xl shadow-lg p-6">
              <input
                type="text"
                placeholder="Search deductions"
                value={searchDeduction}
                onChange={(e) => setSearchDeduction(e.target.value)}
                className="w-1/2 px-4 py-2 bg-white rounded-lg border border-black focus:outline-none focus:ring-2 focus:ring-purple-400 mb-4"
              />
              <div className="max-h-72 overflow-y-auto space-y-2">
                {filteredDeductionList.length === 0 ? (
                  <p className="text-gray-600">No deductions found.</p>
                ) : (
                  filteredDeductionList.map((d) => (
                    <button
                      key={d._id}
                      onClick={() => {
                        setSelectedDeduction(d);
                        setIsModalOpen(true);
                      }}
                      className="w-full text-left p-3 bg-white rounded-lg border border-black flex justify-between hover:bg-gray-100"
                    >
                      <div>
                        <p className="font-bold">
                          {d.name} - {format(new Date(d.date), "dd/MM/yy")}
                        </p>
                        <p className="text-sm text-gray-600">{d.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">
                          ${d.amount}
                        </span>
                        <Trash
                          size={20}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                          onClick={(e) => handleDeleteDeduction(e, d._id)}
                        />
                      </div>
                    </button>
                  ))
                )}
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

          {(selectedMetric === "GSTCollected" ||
            selectedMetric === "GSTPaid") && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                GST Collected vs GST Paid
              </h2>
              <p className="text-gray-600 mb-4">
                Comparison of GST collected and paid
              </p>
              <div className="h-80 w-full">
                <ResponsiveContainer>
                  <BarChart data={combinedItems}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="collected"
                      fill="#6f597b"
                      name="GST Collected"
                    />
                    <Bar dataKey="paid" fill="#c6b6cf" name="GST Paid" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditDeductionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDeduction(null);
        }}
        deduction={selectedDeduction}
        onSave={handleSave}
      />

      <ConfirmModal
        open={showConfirm}
        message="Are you sure you want to delete this item?"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};
