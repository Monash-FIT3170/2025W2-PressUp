import { Meteor } from "meteor/meteor";
import { useState, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import type { UiOrder } from "./KitchenMgmtTypes";

type UiMenuItem = UiOrder["menuItems"][number];

type OrderCardProps = {
  order: UiOrder;
};

function mergeItemsWithPrev(
  prev: UiMenuItem[],
  fromDb: UiMenuItem[],
): UiMenuItem[] {
  return fromDb.map((dbIt, i) => {
    const prevServed = prev[i]?.served ?? dbIt.served ?? false;
    return {
      ...dbIt,
      served: prevServed,
    };
  });
}

export const OrderCard = ({ order }: OrderCardProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: order._id,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  // Dialog state
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(order.status);

  type UiMenuItem = UiOrder["menuItems"][number];
  const [items, setItems] = useState<UiMenuItem[]>(
    order.menuItems.map((mi) => ({
      ...mi,
      served: mi.served ?? false,
    })),
  );

  const allServed = items.length > 0 && items.every((it) => !!it.served);

  useEffect(() => {
    setItems((prev) =>
      mergeItemsWithPrev(
        prev,
        order.menuItems.map((mi) => ({ ...mi, served: mi.served ?? false })),
      ),
    );
  }, [order._id, order.menuItems]);

  const toggleServed = (index: number) => {
    setItems((prev) => {
      const next = prev.map((it, i) =>
        i === index ? { ...it, served: !it.served } : it,
      );
      Meteor.call(
        "orders.setMenuItemServed",
        order._id,
        index,
        !prev[index].served,
      );
      return next;
    });
  };

  const setAll = (val: boolean) => {
    setItems((prev) => {
      const next = prev.map((it) => ({ ...it, served: val }));
      Meteor.call("orders.setAllMenuItemsServed", order._id, val);
      return next;
    });
  };

  const handleStatusChange = (next: string) => {
    if (next === "served" && !(status === "ready" && allServed)) {
      alert("you must check all items as served before marking as served");
      return;
    }
    setStatus(next as UiOrder["status"]);
  };

  const handleSave = () => {
    if (!order || !order._id) {
      return;
    }

    Meteor.call(
      "orders.updateOrder",
      order._id,
      { orderStatus: status },
      (err?: Meteor.Error) => {
        if (err) {
          console.error(err);
          alert(`fail to update: ${err.reason || err.message}`);
          return;
        }
        setOpen(false);
      },
    );
  };

  return (
    <>
      {/* entire card */}
      <div
        ref={setNodeRef}
        className="rounded-lg bg-white p-4 shadow-sm hover:shadow-md border-press-up-purple border-3"
        style={{ ...style, border: "3px solid #8E44AD" }}
      >
        {/* drag handler */}
        <div
          {...listeners}
          {...attributes}
          className="cursor-grab w-5 h-5 bg-gray-300 mb-2 rounded"
          title="Drag to move"
        />

        {/* click space */}
        <div className="cursor-pointer" onClick={() => setOpen(true)}>
          <h3 className="font-medium text-press-up-purple text-xl">
            Order #{order.orderNo}
          </h3>
          <p className="font-bold text-lg text-press-up-purple">
            Table {order.tableNo}
          </p>
          <p className="text-sm text-press-up-purple">{order.createdAt}</p>

          <ul className="mt-3 list-disc list-inside text-lg text-press-up-purple">
            {Array.isArray(order.menuItems) && order.menuItems.length > 0 ? (
              order.menuItems.map((item, index) => (
                <li key={index}>{item.name}</li>
              ))
            ) : (
              <li className="italic text-sm text-press-up-purple">No items</li>
            )}
          </ul>
        </div>
      </div>

      {/* Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent dividers>
          <p>
            <strong>Order No:</strong> {order.orderNo}
          </p>
          <p>
            <strong>Table No:</strong> {order.tableNo}
          </p>
          <p>
            <strong>Created At:</strong> {order.createdAt}
          </p>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 1, mb: 1 }}
          >
            <Typography fontWeight={700}>Menu Items:</Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                onClick={() => setAll(true)}
                sx={{
                  borderColor: "#8E44AD",
                  color: "#8E44AD",
                  border: "1px solid",
                  "&:hover": {
                    borderColor: "#732d91",
                    backgroundColor: "rgba(142,68,173,0.08)",
                  },
                }}
              >
                Check all
              </Button>

              <Button
                size="small"
                onClick={() => setAll(false)}
                sx={{
                  borderColor: "#8E44AD",
                  color: "#8E44AD",
                  border: "1px solid",
                  "&:hover": {
                    borderColor: "#732d91",
                    backgroundColor: "rgba(142,68,173,0.08)",
                  },
                }}
              >
                Uncheck all
              </Button>
            </Stack>
          </Stack>

          <List dense>
            {items.length > 0 ? (
              items.map((it, idx) => (
                <ListItem
                  key={`${it.name}-${idx}`}
                  secondaryAction={<Chip label={`x${it.quantity}`} />}
                  disableGutters
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={!!it.served}
                      onChange={() => toggleServed(idx)}
                      tabIndex={-1}
                    />
                  </ListItemIcon>
                  <ListItemText primary={it.name} />
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" fontStyle="italic">
                No items
              </Typography>
            )}
          </List>

          {/* Status Dropdown */}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => handleStatusChange(String(e.target.value))}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="preparing">Preparing</MenuItem>
              <MenuItem value="ready">Ready</MenuItem>

              <MenuItem
                value="served"
                disabled={!(status === "ready" && allServed)}
              >
                Served{" "}
                {!(status === "ready" && allServed)
                  ? "(Ready + all checked)"
                  : ""}
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
            sx={{
              borderColor: "#8E44AD",
              color: "#8E44AD",
              "&:hover": {
                borderColor: "#732d91",
                backgroundColor: "rgba(142,68,173,0.08)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              backgroundColor: "#8E44AD",
              "&:hover": {
                backgroundColor: "#732d91",
              },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
