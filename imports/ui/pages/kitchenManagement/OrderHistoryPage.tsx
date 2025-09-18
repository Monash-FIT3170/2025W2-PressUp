// imports/ui/pages/kitchen/OrderHistoryPage.tsx

import { useEffect, useMemo, useState } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { usePageTitle } from "../../hooks/PageTitleContext";
import {
  OrdersCollection,
  Order as DBOrder,
} from "../../../api/orders/OrdersCollection";

// Use shared UI components (Roster style)
import { Button } from "../../components/interaction/Button";
import { Select } from "../../components/interaction/Select";
import { Input } from "../../components/interaction/Input";

type RowOrder = {
  _id: string;
  orderNo: number;
  tableNo: number | null;
  createdAt: string;
  status: "pending" | "preparing" | "ready" | "served";
  items: string;
  paid: boolean;
};

export const OrderHistoryPage = () => {
  // Page title (same pattern as RosterPage)
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Kitchen Management - Order History");
  }, [setPageTitle]);

  // Subscribe + map DB docs to flat rows for display
  const orders: RowOrder[] = useTracker(() => {
    const sub = Meteor.subscribe("orders");
    if (!sub.ready()) return [];
    const docs = OrdersCollection.find({}, { sort: { createdAt: -1 } }).fetch();
    return docs.map((doc: DBOrder) => ({
      _id: doc._id,
      orderNo: doc.orderNo,
      tableNo: doc.tableNo ?? null,
      createdAt: new Date(doc.createdAt).toLocaleString(),
      status: doc.orderStatus,
      items: (doc.menuItems ?? [])
        .map((mi) => `${mi.name} x${mi.quantity ?? 1}`)
        .join(", "),
      paid: !!doc.paid,
    }));
  }, []);

  // ---- Controls state ----
  const [statusFilter, setStatusFilter] = useState<"served" | "all">("served");
  const [q, setQ] = useState("");

  // ---- Filtering ----
  const filtered = useMemo(() => {
    const base =
      statusFilter === "served"
        ? orders.filter((o) => o.status === "served")
        : orders;

    if (!q.trim()) return base;

    const key = q.toLowerCase();
    return base.filter((o) => {
      // EN: If no table number, treat it as "takeaway" for searching
      const tableText = o.tableNo != null ? String(o.tableNo) : "takeaway";
      return (
        String(o.orderNo).includes(key) ||
        tableText.includes(key) ||
        o.items.toLowerCase().includes(key)
      );
    });
  }, [orders, statusFilter, q]);

  // ---- Actions ----
  const reopen = (id: string, to: RowOrder["status"]) => {
    Meteor.call(
      "orders.updateOrder",
      id,
      { orderStatus: to },
      (err?: Meteor.Error) => {
        if (err) {
          console.error(err);
          alert(`Update failed: ${err.reason || err.message}`);
        }
      },
    );
  };

  // ---- Render ----
  return (
    <div className="flex flex-1 flex-col p-6 gap-4 overflow-hidden">
      {/* Page heading (Roster style) */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-press-up-purple">
          Order History
        </h1>
      </div>

      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        {/* Filter dropdown (shared Select) */}
        <div className="w-full sm:w-60">
          {/* EN: Controlled Select, integrates with statusFilter */}
          <Select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "served" | "all")
            }
          >
            <option value="served">Served only</option>
            <option value="all">All statuses</option>
          </Select>
        </div>

        {/* Search input (shared Input) */}
        <div className="w-full sm:flex-1">
          <Input
            placeholder="Search (order/table/item)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-auto flex-1 rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-left">
          <thead className="sticky top-0 z-10">
            <tr className="grid gap-y-2 grid-cols-[minmax(90px,0.6fr)_minmax(80px,0.4fr)_minmax(180px,0.9fr)_minmax(120px,0.6fr)_minmax(320px,1.8fr)_minmax(220px,0.9fr)] bg-press-up-light-purple text-press-up-purple font-semibold">
              <th className="py-2 px-3">Order #</th>
              <th className="py-2 px-3">Table</th>
              <th className="py-2 px-3">Created At</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Items</th>
              <th className="py-2 px-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filtered.map((row) => {
              const isPaid =
                orders.find((o) => o._id === row._id)?.paid === true;

              // EN: Simple badge for status
              const statusBadge =
                row.status === "served" ? (
                  <span className="inline-block px-2 py-0.5 rounded-md text-xs font-bold bg-green-600 text-white">
                    {row.status.toUpperCase()}
                  </span>
                ) : row.status === "ready" ? (
                  <span className="inline-block px-2 py-0.5 rounded-md text-xs font-bold bg-yellow-600 text-white">
                    {row.status.toUpperCase()}
                  </span>
                ) : row.status === "preparing" ? (
                  <span className="inline-block px-2 py-0.5 rounded-md text-xs font-bold bg-blue-600 text-white">
                    {row.status.toUpperCase()}
                  </span>
                ) : (
                  <span className="inline-block px-2 py-0.5 rounded-md text-xs font-bold bg-gray-600 text-white">
                    {row.status.toUpperCase()}
                  </span>
                );

              return (
                <tr
                  key={row._id}
                  className="grid gap-y-2 grid-cols-[minmax(90px,0.6fr)_minmax(80px,0.4fr)_minmax(180px,0.9fr)_minmax(120px,0.6fr)_minmax(320px,1.8fr)_minmax(220px,0.9fr)] hover:bg-press-up-light-purple/40"
                >
                  <td className="py-2 px-3">{row.orderNo}</td>
                  <td className="py-2 px-3">
                    {row.tableNo != null ? row.tableNo : "Takeaway"}
                  </td>
                  <td className="py-2 px-3">{row.createdAt}</td>
                  <td className="py-2 px-3">{statusBadge}</td>
                  <td className="py-2 px-3 truncate" title={row.items}>
                    {row.items || <em className="text-gray-500">No items</em>}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex justify-end gap-2">
                      {/* EN: Reopen to Ready */}
                      <Button
                        disabled={isPaid}
                        onClick={() => reopen(row._id, "ready")}
                        className="!bg-transparent !text-press-up-purple !border !border-press-up-purple hover:!bg-press-up-purple/10 disabled:opacity-50"
                      >
                        Reopen: Ready
                      </Button>

                      {/* EN: Reopen to Preparing */}
                      <Button
                        disabled={isPaid}
                        onClick={() => reopen(row._id, "preparing")}
                        className="!bg-transparent !text-press-up-purple !border !border-press-up-purple hover:!bg-press-up-purple/10 disabled:opacity-50"
                      >
                        Reopen: Preparing
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr className="grid grid-cols-1">
                <td className="py-8 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
