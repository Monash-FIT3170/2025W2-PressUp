import { useState } from "react";
import { useNavigate } from "react-router";
import { Meteor } from "meteor/meteor";
import { Order } from "/imports/api";
import { TablesCollection } from "/imports/api/tables/TablesCollection";
import { OrderStatus } from "/imports/api/orders/OrdersCollection";

interface PaymentModalProps {
  tableNo?: number | null;
  order: Order;
}

export const PaymentModal = ({ order }: PaymentModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => {
    if (order.menuItems.length === 0) {
      alert("Cannot pay for an order with no items.");
      return;
    }
    if (order.orderStatus !== OrderStatus.Served) {
      alert("Only SERVED orders can be paid. Please mark as served first.");
      return;
    }
    setIsOpen(true);
  };
  const closeModal = () => setIsOpen(false);

  const navigate = useNavigate();

  // Update order status
  const finalizePayment = () => {
    if (!order || !order._id) {
      return;
    }
    const fields = {
      orderStatus: OrderStatus.Served,
      paid: true,
    };
    Meteor.call("orders.updateOrder", order._id, { ...fields });

    // Clear the table's activeOrderID if this is a dine-in order
    if (order.tableNo !== null && order.tableNo !== undefined) {
      // Find the table by tableNo and clear its activeOrderID
      Meteor.call(
        "tables.clearOrder",
        TablesCollection.findOne({ tableNo: order.tableNo })?._id,
      );
    }
  };

  const handleConfirm = () => {
    finalizePayment();
    closeModal();
    navigate(`/receipt?orderNo=${order.orderNo}`);
  };

  return (
    <div>
      <button
        onClick={openModal}
        className="w-full bg-press-up-positive-button hover:bg-press-up-hover text-white font-bold py-2 px-4 rounded-full"
        disabled={
          Boolean(order?.isLocked) ||
          order.orderStatus !== OrderStatus.Served ||
          order.menuItems.length === 0
        }
      >
        Pay
      </button>

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
          <h2 className="text-xl text-gray-700 font-bold mb-4">
            Confirm Payment
          </h2>
          <p className="mb-6 text-gray-700">
            Are you sure you want to proceed with the payment?
          </p>
          <div className="grid grid-cols-2 justify-items-center gap-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg"
            >
              Cancel
            </button>
            {/* Link to receipt page */}
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-press-up-purple text-white font-semibold rounded-lg"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
