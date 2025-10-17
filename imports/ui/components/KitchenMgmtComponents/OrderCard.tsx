import { Meteor } from "meteor/meteor";
import { useState, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
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
import { OrderType } from "/imports/api/orders/OrdersCollection";
import { MenuItemsCollection } from "/imports/api/menuItems/MenuItemsCollection";
import { useTracker, useSubscribe } from "meteor/react-meteor-data";

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

function formatWait(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export const OrderCard = ({ order }: OrderCardProps) => {
  useSubscribe("menuItems");
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: order._id,
    });

  const dragStyle: React.CSSProperties = {
    transform: transform ? CSS.Translate.toString(transform) : undefined, // Apply transform
    transition: isDragging ? "transform 0s" : "transform 200ms ease", // Smooth return
    zIndex: isDragging ? 1000 : "auto", // Ensure dragged card stays on top
  };

  // Dialog state
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(order.status);

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
      alert("You must check all items as served before marking as served");
      return;
    }
    setStatus(next as UiOrder["status"]);
  };

  // (A) createdMs: Safely calculate (prevent NaN/undefined issues)
  const createdMs = Number.isFinite(order.createdAtMs)
    ? (order.createdAtMs as number)
    : Date.parse(order.createdAt) || Date.now();

  // (B) Waiting time state/effect
  const [waitText, setWaitText] = useState(() =>
    formatWait(Date.now() - createdMs),
  );
  useEffect(() => {
    const tick = () => setWaitText(formatWait(Date.now() - createdMs));
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [createdMs]);

  // (C) Color calculation (also uses createdMs)
  const ageMs = Date.now() - createdMs;
  const waitColor =
    ageMs < 10 * 60 * 1000
      ? "#2ecc71"
      : ageMs < 20 * 60 * 1000
        ? "#f39c12"
        : "#e74c3c";

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

  // Build default selections from canonical
  const getDefaultBaseKeys = (
    baseDefs?: Array<{ key: string; default: boolean; removable?: boolean }>,
  ) =>
    (baseDefs ?? [])
      .filter((b) => (b.removable === false ? true : !!b.default))
      .map((b) => b.key);

  const getDefaultSelections = (optionGroups?: Array<{
    id: string;
    label: string;
    type: "single" | "multiple";
    required?: boolean;
    options: Array<{ key: string; label: string; default?: boolean }>;
  }>) => {
    const out: Record<string, string[]> = {};
    for (const g of optionGroups ?? []) {
      const defaults = g.options.filter((o) => o.default).map((o) => o.key);
      if (g.type === "single") {
        if (defaults.length > 0) out[g.id] = [defaults[0]];
        else if (g.required && g.options[0]) out[g.id] = [g.options[0].key];
        else out[g.id] = [];
      } else {
        out[g.id] = defaults;
      }
    }
    return out;
  };

  const sameArray = (a: string[] = [], b: string[] = []) => {
    if (a.length !== b.length) return false;
    const sa = [...a].sort().join("|");
    const sb = [...b].sort().join("|");
    return sa === sb;
  };

  // ===== Canonical map for the items on this card (one hook, no hooks-in-loop) =====
  const canonicalMap = useTracker(() => {
    const rawIds = (order.menuItems ?? [])
      .map((mi) => (mi as any).menuItemId)
      .filter(Boolean);
  
    if (rawIds.length === 0) return {} as Record<string, any>;
  
    const asStrings = rawIds.map((v: any) =>
      typeof v === "string" ? v : v?._str ?? String(v),
    );
  
    const selector = { _id: { $in: [...rawIds, ...asStrings] as any } };
    const docs = MenuItemsCollection.find(selector as any).fetch();
  
    const map: Record<string, any> = {};
    docs.forEach((d: any) => {
      const keyObj = d?._id;
      const keyStr = typeof keyObj === "string" ? keyObj : keyObj?._str ?? String(keyObj);
      map[keyStr] = d;
      if (keyObj) map[keyObj] = d;
    });
    return map;
  }, [order.menuItems]);

  // ===== Build brief "customization notes" for a line item =====
  const computeCustomNotes = (menuItem: UiMenuItem): string[] => {
    const rawId: any = (menuItem as any)?.menuItemId;
    const keyStr = typeof rawId === "string" ? rawId : rawId?._str ?? String(rawId);
    const canonical = canonicalMap[keyStr] ?? canonicalMap[rawId];
    const notes: string[] = [];
    if (!canonical) return notes;

    const baseDefs = canonical.baseIngredients ?? [];
    const defaultBaseKeys = getDefaultBaseKeys(baseDefs);
    const chosenBase = new Set(
      (menuItem as any).baseIncludedKeys &&
        (menuItem as any).baseIncludedKeys.length > 0
        ? (menuItem as any).baseIncludedKeys
        : defaultBaseKeys,
    );

    // Base adds/removals (skip non-removable)
    for (const b of baseDefs) {
      if (b.removable === false) continue;
      const wasDefault = !!b.default;
      const isOn = chosenBase.has(b.key);
      if (wasDefault && !isOn) notes.push(`No ${b.label}`);
      if (!wasDefault && isOn) notes.push(`Add ${b.label}`);
    }

    // Option changes
    const optionGroups = canonical.optionGroups ?? [];
    const defaultSelections = getDefaultSelections(optionGroups);
    const savedSelections =
      ((menuItem as any).optionSelections as Record<string, string[]>) ?? {};

    for (const g of optionGroups) {
      const baseKey = g.id.split("-")[0];
      const baseExists = baseDefs.some((b: { key: string }) => b.key === baseKey);
      if (baseExists && !chosenBase.has(baseKey)) continue;

      const saved = Array.isArray(savedSelections[g.id])
        ? savedSelections[g.id]
        : [];
      const def = defaultSelections[g.id] ?? [];

      if (!sameArray(saved, def)) {
        const savedLabels = g.options
          .filter((o: { key: string }) => saved.includes(o.key))
          .map((o: { label: string }) => o.label);

        if (g.type === "single") {
          const label = savedLabels[0] ?? "(none)";
          notes.push(`${g.label}: ${label}`);
        } else if (savedLabels.length > 0) {
          notes.push(`${g.label}: ${savedLabels.join(", ")}`);
        }
      }
    }

    return notes;
  };



  return (
    <>
      <div
        ref={setNodeRef}
        className="rounded-lg bg-white p-4 shadow-sm hover:shadow-md border-press-up-purple border-3"
        style={{ border: "3px solid #8E44AD", ...dragStyle }}
      >
        <div
          {...listeners}
          {...attributes}
          className="cursor-grab w-5 h-5 bg-gray-300 mb-2 rounded"
          title="Drag to move"
          role="button"
          aria-label="Drag order card"
        />

        <div className="cursor-pointer" onClick={() => setOpen(true)}>
          <div className="flex items-center justify-between gap-2 w-full">
            <h3 className="font-medium text-press-up-purple text-xl flex-1 min-w-0 truncate">
              Order #{order.orderNo}
            </h3>

            <div className="mt-1">
              <Chip
                size="small"
                label={`Waiting ${waitText}`}
                title={new Date(createdMs).toLocaleString()}
                sx={{
                  backgroundColor: waitColor,
                  color: "#fff",
                  fontWeight: 600,
                }}
              />
            </div>
          </div>

          <div>
            <p className="font-bold text-lg text-press-up-purple">
              {order.orderType == OrderType.DineIn
                ? order.tableNo == null
                  ? "Dine-In"
                  : `Table No: ${order.tableNo}`
                : "Takeaway"}
            </p>
            <p className="text-sm text-press-up-purple">{order.createdAt}</p>
            <ul className="mt-3 space-y-1 text-lg text-press-up-purple">
              {Array.isArray(order.menuItems) && order.menuItems.length > 0 ? (
                order.menuItems.map((item, index) => {
                  const notes = computeCustomNotes(item);
                  return (
                    <li key={index} className="flex flex-wrap items-baseline">
                      <span className="mr-2">-</span>
                      <span className="font-semibold mr-1">{item.quantity}x</span>
                      <span className="mr-2">{item.name}</span>
                      {notes.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {notes.join(" · ")}
                        </span>
                      )}
                    </li>
                  );
                })
              ) : (
                <li className="italic text-sm text-press-up-purple">No items</li>
              )}
            </ul>
          </div>
        </div>
      </div>

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
            <strong>
              {order.orderType == OrderType.DineIn
                ? order.tableNo == null
                  ? "Dine-In"
                  : `Table No: ${order.tableNo}`
                : "Takeaway"}
            </strong>
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
              items.map((it, idx) => {
                const notes = computeCustomNotes(it);
                return (
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
                    <ListItemText
                      primary={it.name}
                      secondary={
                        notes.length > 0 ? (
                          <span style={{ color: "#6b7280" /* Tailwind gray-500 */ }}>
                            {notes.join(" · ")}
                          </span>
                        ) : undefined
                      }
                    />
                  </ListItem>
                );
              })
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
