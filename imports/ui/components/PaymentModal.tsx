import { useState } from "react";
import { Link } from "react-router";

export const PaymentModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <div>
      <button
        onClick={openModal}
        className="w-full bg-press-up-positive-button hover:bg-press-up-positive-button text-white font-bold py-2 px-4 rounded-full"
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
            {/* Linke to receipt page */}
            <Link to="/receipt">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-press-up-purple text-white font-semibold rounded-lg"
              >
                Confirm
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
