import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import type { UiOrder } from "./KitchenMgmtTypes";

type OrderCardProps = {
  order: UiOrder;
};


export const OrderCard = ({order}: OrderCardProps) => {

  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: order._id, 
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  // Dialog state
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(order.status);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      {/* entire card */}
      <div
        ref={setNodeRef}
        className="rounded-lg bg-white p-4 shadow-sm hover:shadow-md border-press-up-purple border-3"
        style={style}
      >
        {/* drag handleer */}
        <div
          {...listeners}
          {...attributes}
          className="cursor-grab w-5 h-5 bg-gray-300 mb-2 rounded"
          title="Drag to move"
        ></div>

        {/* click space */}
        <div className="cursor-pointer" onClick={handleOpen}>
          <h3 className="font-medium text-press-up-purple text-xl">Order #{order.orderNo}</h3>
          <p className="font-bold text-lg text-press-up-purple">Table {order.tableNo}</p>
          <p className="text-sm text-press-up-purple">{order.createdAt}</p>
          <ul className="mt-3 list-disc list-inside text-lg text-press-up-purple">
            {Array.isArray(order.menuItems) && order.menuItems.length > 0 ? (
              order.menuItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))
            ) : (
              <li className="italic text-sm text-press-up-purple">No items</li>
            )}
          </ul>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent dividers>
          <p><strong>Order No:</strong> {order.orderNo}</p>
          <p><strong>Table No:</strong> {order.tableNo}</p>
          <p><strong>Created At:</strong> {order.createdAt}</p>
          <p><strong>Menu Items:</strong></p>
          <ul>
            {Array.isArray(order.menuItems) && order.menuItems.length > 0 ? (
              order.menuItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))
            ) : (
              <li>No items</li>
            )}
          </ul>

          {/* Status Dropdown */}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="preparing">Preparing</MenuItem>
              <MenuItem value="ready">Ready</MenuItem>
              <MenuItem value="served">Served</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancel</Button>
          <Button onClick={() => { console.log("Selected Status:", status); handleClose(); }} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};