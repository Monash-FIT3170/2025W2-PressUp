import { useEffect, useMemo, useState } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { usePageTitle } from "../../hooks/PageTitleContext";
import {
  OrdersCollection,
  Order as DBOrder,
} from "../../../api/orders/OrdersCollection";

import { Button } from "../../components/interaction/Button";
import { Select } from "../../components/interaction/Select";
import { Input } from "../../components/interaction/Input";

type RowOrder = {
  _id: string;
  orderNo: number;
  tableNo: number | null;
  createdAt: string;
  status: "pending" | "preparing" | "ready" | "served" | "paid";
  items: string;
  paid: boolean;
};

export const OrderHistoryPage = () => {
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Kitchen Management - Order History");
  }, [setPageTitle]);

  const orders: RowOrder[] = useTracker(() => {
    const sub = Meteor.subscribe("orders");
    if (!sub.ready()) return [];
    const docs = OrdersCollection.find({}, { sort: { createdAt: -1 } }).fetch();
    return docs.map((doc: DBOrder) => ({
      _id: doc._id,
      orderNo: doc.orderNo,
      tableNo: doc.tableNo ?? null,
      createdAt: new Date(doc.createdAt).toLocaleString(),
      status: doc.orderStatus as RowOrder["status"],
      items: (doc.menuItems ?? [])
        .map((mi) => `${mi.name} x${mi.quantity ?? 1}`)
        .join(", "),
      paid: !!doc.paid,
    }));
  }, []);

  const [statusFilter, setStatusFilter] = useState<"served" | "paid" | "all">(
    "all",
  );
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const base =
      statusFilter === "served"
        ? orders.filter((o) => o.status === "served")
        : statusFilter === "paid"
          ? orders.filter((o) => o.status === "paid")
          : orders;

    if (!q.trim()) return base;

    const key = q.toLowerCase();
    return base.filter((o) => {
      const tableText = o.tableNo != null ? String(o.tableNo) : "takeaway";
      return (
        String(o.orderNo).includes(key) ||
        tableText.includes(key) ||
        o.items.toLowerCase().includes(key)
      );
    });
  }, [orders, statusFilter, q]);

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

  return (
    <div className="flex flex-1 flex-col p-6 gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-press-up-purple">
          Order History
        </h1>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div className="w-full sm:w-60">
          <Select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "served" | "paid" | "all")
            }
          >
            <option value="served">Served only</option>
            <option value="paid">Paid only</option>
            <option value="all">All statuses</option>
          </Select>
        </div>

        <div className="w-full sm:flex-1">
          <Input
            placeholder="Search (order/table/item)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
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

              // Unified badge for all statuses
              const statusBadge = (() => {
                const base =
                  "inline-block px-2 py-0.5 rounded-md text-xs font-bold text-white";
                switch (row.status) {
                  case "pending":
                    return (
                      <span className={`${base} bg-gray-500`}>PENDING</span>
                    );
                  case "preparing":
                    return (
                      <span className={`${base} bg-blue-600`}>PREPARING</span>
                    );
                  case "ready":
                    return (
                      <span className={`${base} bg-yellow-600`}>READY</span>
                    );
                  case "served":
                    return (
                      <span className={`${base} bg-green-600`}>SERVED</span>
                    );
                  case "paid":
                    return (
                      <span className={`${base} bg-purple-700`}>PAID</span>
                    );
                  default:
                    return (
                      <span className={`${base} bg-gray-600`}>
                        {(row.status as string).toUpperCase()}
                      </span>
                    );
                }
              })();

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

                  {/* Only show actions for SERVED & not paid */}
                  <td className="py-2 px-3">
                    {row.status === "served" && !isPaid && (
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => reopen(row._id, "ready")}>
                          Reopen: Ready
                        </Button>
                        <Button variant="ghost" onClick={() => reopen(row._id, "preparing")}>
                          Reopen: Preparing
                        </Button>
                      </div>
                    )}
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
