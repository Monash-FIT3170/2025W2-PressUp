import { useState } from "react";
import { useNavigate } from "react-router";
import { Meteor } from "meteor/meteor";
import { Order } from "/imports/api";
import { TablesCollection } from "/imports/api/tables/TablesCollection";
import { OrderStatus } from "/imports/api/orders/OrdersCollection";
import { Button } from "./interaction/Button";

interface PaymentModalProps {
  tableNo?: number | null;
  order: Order;
}

export const PaymentModal = ({ order }: PaymentModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isServed = order.orderStatus === OrderStatus.Served;
  const openModal = () => {
    if (order.menuItems.length === 0) {
      alert("Cannot pay for an order with no items.");
      return;
    }
    setIsOpen(true);
  };
  const closeModal = () => setIsOpen(false);

  const navigate = useNavigate();

  // Update order status
  const finalizePayment = () => {
    if (!order || !order._id) return;

    Meteor.call("orders.updateOrder", order._id, {
      paid: true,
      orderStatus: OrderStatus.Paid,
    });

    // Clear the table if dine-in
    if (order.tableNo !== null && order.tableNo !== undefined) {
      Meteor.call(
        "tables.clearOrder",
        TablesCollection.findOne({ tableNo: order.tableNo })?._id,
      );
    }
  };

  const handleConfirm = () => {
    finalizePayment();
    closeModal();
    if (order._id) {
      sessionStorage.setItem("activeOrderId", order._id);
    }
    navigate("/receipt");
  };

  return (
    <div>
      <Button
        onClick={openModal}
        variant="positive"
        width="full"
        disabled={Boolean(order?.isLocked) || order.menuItems.length === 0}
      >
        Pay
      </Button>

      {/* Fade In */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-400 ${
          isOpen ? "opacity-100" : "opacity-0 invisible"
        }`}
        onClick={closeModal}
      >
        {/* Modal */}
        <div
          className="bg-white p-6 rounded-2xl shadow-2xl w-80 transform transition-transform duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {isServed ? (
            <>
              <h2 className="text-xl text-gray-700 font-bold mb-4">
                Confirm Payment
              </h2>
              <p className="mb-6 text-gray-700">
                Are you sure you want to proceed with the payment?
              </p>
              <div className="grid grid-cols-2 justify-items-center gap-2">
                <Button onClick={closeModal} variant="negative" width="fit">
                  Cancel
                </Button>
                <Button onClick={handleConfirm} variant="positive" width="fit">
                  Confirm
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl text-gray-700 font-bold mb-4">
                Order is not served
              </h2>
              <p className="mb-4 text-gray-700">
                Only <b>SERVED</b> orders can be paid.
              </p>
              <div className="mb-4 text-sm text-gray-600">
                <div className="mb-2">
                  <span className="font-semibold">Current status:</span>{" "}
                  <span className="inline-block px-2 py-1 rounded bg-gray-100 border">
                    {String(order.orderStatus).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex justify-center">
                <Button onClick={closeModal} variant="negative" width="fit">
                  OK
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
