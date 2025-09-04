import React, { useState, useEffect, FormEvent } from "react";
import { Meteor } from "meteor/meteor";
import { Modal } from "./Modal";
import { Deduction } from "/imports/api/tax/DeductionsCollection";
import { ConfirmModal } from "./ConfirmModal";

interface EditDeductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  deduction: Deduction | null;
  onSave: (updatedDeduction: Partial<Deduction>) => void;
}

export const EditDeductionModal: React.FC<EditDeductionModalProps> = ({
  isOpen,
  onClose,
  deduction,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirm, setConfirm] = useState<"cancel" | "save" | null>(null);

  useEffect(() => {
    if (deduction) {
      setName(deduction.name);
      setDate(deduction.date);
      setDescription(deduction.description || "");
      setAmount(deduction.amount);
    }
  }, [deduction]);

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();

    if (!deduction || !deduction.name || !deduction._id) return;

    Meteor.call(
      "deductions.update",
      deduction.name,
      {
        name,
        date,
        description,
        amount,
      },
      (error: Meteor.Error | undefined) => {
        if (error) {
          console.error("Error updating deduction:", error);
        } else {
          onSave({
            _id: deduction._id,
            name,
            date,
            description,
            amount,
          });
          onClose();
        }
      },
    );
  };

  return (
    <>
      <Modal
        open={isOpen} //onClose={onClose}
        onClose={() => {
          setConfirm("cancel");
          setShowConfirmation(true);
        }}
      >
        <div className="p-4 md:p-5 max-h-[80vh] overflow-y-auto w-full">
          <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
            Edit Deduction
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-press-up-purple border-2 border-press-up-purple text-white text-sm rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 block w-full p-2.5 placeholder-purple-200
                dark:bg-press-up-purple dark:border-press-up-purple dark:placeholder-purple-200 dark:text-white dark:focus:ring-purple-400 dark:focus:border-purple-400"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
                Amount
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setAmount(isNaN(val) ? 0 : val);
                }}
                onBlur={() => setAmount(parseFloat(amount.toFixed(2)))}
                className="bg-press-up-purple border-2 border-press-up-purple text-white text-sm rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 block w-full p-2.5 placeholder-purple-200
                dark:bg-press-up-purple dark:border-press-up-purple dark:placeholder-purple-200 dark:text-white dark:focus:ring-purple-400 dark:focus:border-purple-400"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-press-up-purple border-2 border-press-up-purple text-white text-sm rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 block w-full p-2.5 placeholder-purple-200
                dark:bg-press-up-purple dark:border-press-up-purple dark:placeholder-purple-200 dark:text-white dark:focus:ring-purple-400 dark:focus:border-purple-400"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
                Date
              </label>
              <input
                type="date"
                value={date ? date.toISOString().split("T")[0] : ""}
                onChange={(e) => setDate(new Date(e.target.value))}
                className="bg-press-up-purple border-2 border-press-up-purple text-white text-sm rounded-lg
                        focus:ring-2 focus:ring-purple-400 focus:border-purple-400
                        block w-full p-2.5 placeholder-purple-200
                        dark:bg-press-up-purple dark:border-press-up-purple
                        dark:placeholder-purple-200 dark:text-white
                        dark:focus:ring-purple-400 dark:focus:border-purple-400"
                required
            />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  setConfirm("cancel");
                  setShowConfirmation(true);
                }}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  setConfirm("save");
                  setShowConfirmation(true);
                }}
                className="bg-press-up-purple hover:bg-press-up-purple text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <ConfirmModal
        open={showConfirmation}
        message={confirm === "cancel" ? "Discard changes?" : "Save changes?"}
        onConfirm={() => {
          if (confirm === "cancel") {
            onClose();
          } else if (confirm === "save") {
            handleSubmit();
          }
          setShowConfirmation(false);
          setConfirm(null);
        }}
        onCancel={() => {
          setShowConfirmation(false);
          setConfirm(null);
        }}
      />
    </>
  );
};
