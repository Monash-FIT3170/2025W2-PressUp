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
import { Table, TableColumn } from "../../components/Table";
import { Pill } from "../../components/Pill";
import { SmallPill } from "../../components/SmallPill";
import { Hide } from "../../components/display/Hide";

type RowOrder = {
  _id: string;
  orderNo: number;
  tableNo: number[] | null;
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
      const tableText = o.tableNo != null ? o.tableNo.join(", ") : "takeaway";
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

  const columns: TableColumn<RowOrder>[] = [
    {
      key: "orderNo",
      header: "#",
      gridCol: "min-content",
      render: (row) => <span>{row.orderNo}</span>,
    },
    {
      key: "tableNo",
      header: "Table",
      gridCol: "min-content",
      render: (row) => (
        <span>{row.tableNo != null ? row.tableNo.join(", ") : "Takeaway"}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Created At",
      gridCol: "min-content",
      render: (row) => <span>{row.createdAt}</span>,
    },
    {
      key: "status",
      header: "Status",
      gridCol: "min-content",
      render: (row) => {
        switch (row.status) {
          case "pending":
            return (
              <Pill
                bgColour="bg-gray-500"
                borderColour="border-gray-500"
                textColour="text-white"
              >
                Pending
              </Pill>
            );
          case "preparing":
            return (
              <Pill
                bgColour="bg-blue-600"
                borderColour="border-blue-600"
                textColour="text-white"
              >
                Preparing
              </Pill>
            );
          case "ready":
            return (
              <Pill
                bgColour="bg-yellow-600"
                borderColour="border-yellow-600"
                textColour="text-white"
              >
                Ready
              </Pill>
            );
          case "served":
            return (
              <Pill
                bgColour="bg-green-600"
                borderColour="border-green-600"
                textColour="text-white"
              >
                Served
              </Pill>
            );
          case "paid":
            return (
              <Pill
                bgColour="bg-purple-700"
                borderColour="border-purple-700"
                textColour="text-white"
              >
                Paid
              </Pill>
            );
          default:
            return (
              <Pill
                bgColour="bg-gray-600"
                borderColour="bg-gray-600"
                textColour="text-white"
              >
                {(row.status as string).toUpperCase()}
              </Pill>
            );
        }
      },
    },
    {
      key: "items",
      header: "Items",
      gridCol: "2fr",
      render: (row) => {
        // Parse the items string back into individual items
        const itemsList = row.items ? row.items.split(", ") : [];

        return (
          <div className="flex flex-wrap gap-1">
            {itemsList.map((item, itemIndex) => (
              <SmallPill key={itemIndex}>{item}</SmallPill>
            ))}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      gridCol: "min-content",
      align: "center",
      render: (row) => {
        const isPaid = orders.find((o) => o._id === row._id)?.paid === true;
        const hide = !(row.status === "served" && !isPaid);
        return (
          <div className="flex justify-center gap-2 px-2">
            <Hide hide={hide}>
              <Button
                variant="positive"
                onClick={() => reopen(row._id, "ready")}
              >
                Reopen: Ready
              </Button>
              <Button
                variant="positive"
                onClick={() => reopen(row._id, "preparing")}
              >
                Reopen: Preparing
              </Button>
            </Hide>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-1 flex-col h-full">
      {" "}
      {/* Add h-full */}
      {/* Controls */}
      <div className="flex items-center p-4 gap-3 flex-shrink-0">
        {" "}
        {/* Add flex-shrink-0 to prevent controls from shrinking */}
        <div className="w-60">
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
        <div className="flex-1">
          <Input
            placeholder="Search (order/table/item)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
      <Table
        columns={columns}
        data={filtered}
        emptyMessage="No orders found."
      />
    </div>
  );
};
