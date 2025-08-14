import { useState, useMemo } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { OrdersCollection, Order as DBOrder } from "../../../api/orders/OrdersCollection";
import {
  Box, Typography, Stack, TextField, FormControl, InputLabel, Select, MenuItem,
  Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button, Chip
} from "@mui/material";

type RowOrder = {
  _id: string;
  orderNo: number;
  tableNo: number;
  createdAt: string;
  status: "pending" | "preparing" | "ready" | "served";
  items: string;
};

export const OrderHistoryPage = () => {
  const orders: RowOrder[] = useTracker(() => {
    const sub = Meteor.subscribe("orders");
    if (!sub.ready()) return [];
    const docs = OrdersCollection.find({}, { sort: { createdAt: -1 } }).fetch();
    return docs.map((doc: DBOrder) => ({
      _id: doc._id as string,
      orderNo: doc.orderNo,
      tableNo: doc.tableNo,
      createdAt: new Date(doc.createdAt).toLocaleString(),
      status: doc.orderStatus as RowOrder["status"],
      items: (doc.menuItems ?? []).map(mi => `${mi.name} x${mi.quantity ?? 1}`).join(", ")
    }));
  }, []);

  const [statusFilter, setStatusFilter] = useState<"served" | "all">("served");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const base = statusFilter === "served"
      ? orders.filter(o => o.status === "served")
      : orders;
    if (!q.trim()) return base;
    const key = q.toLowerCase();
    return base.filter(o =>
      String(o.orderNo).includes(key) ||
      String(o.tableNo).includes(key) ||
      o.items.toLowerCase().includes(key)
    );
  }, [orders, statusFilter, q]);


  const reopen = (id: string, to: RowOrder["status"]) => {
    Meteor.call("orders.updateOrder", id, { orderStatus: to }, (err?: Meteor.Error) => {
      if (err) {
        console.error(err);
        alert(`Update failed: ${err.reason || err.message}`);
      }
    });
  };

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={2}>Order History</Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={statusFilter}
            label="Filter"
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <MenuItem value="served">Served only</MenuItem>
            <MenuItem value="all">All statuses</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Search (order/table/item)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          sx={{ minWidth: 280 }}
        />
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Table</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Items</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map(row => (
              <TableRow key={row._id} hover>
                <TableCell>{row.orderNo}</TableCell>
                <TableCell>{row.tableNo}</TableCell>
                <TableCell>{row.createdAt}</TableCell>
                <TableCell>
                  <Chip label={row.status.toUpperCase()} size="small" />
                </TableCell>
                <TableCell sx={{ maxWidth: 520, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {row.items || <em>No items</em>}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => reopen(row._id, "ready")}
                    >
                      Reopen: Ready
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => reopen(row._id, "preparing")}
                    >
                      Reopen: Preparing
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">No orders found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
