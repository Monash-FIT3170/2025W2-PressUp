import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { MenuItemsCollection } from "/imports/api/menuItems/MenuItemsCollection";
import { ConfirmModal } from "./ConfirmModal";

interface AddIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
}

export const AddIngredientModal: React.FC<AddIngredientModalProps> = ({
  isOpen,
  onClose,
  itemName,
}) => {
  const item = useTracker(() =>
    MenuItemsCollection.findOne({ name: itemName })
  );
  const [newIngredient, setNewIngredient] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredient.trim()) return;

    setIsSubmitting(true);
    try {
      await new Promise<void>((resolve, reject) => {
        Meteor.call(
          "items.updateItemIngredients",
          itemName,
          [...(item.ingredients || []), newIngredient.trim()],
          (error: Meteor.Error) => (error ? reject(error) : resolve())
        );
      });
      setNewIngredient("");
    } catch (error) {
      alert(
        "Error adding ingredient: " +
          ((error as Meteor.Error).reason || (error as Error).message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (ingredient: string) => {
    const updated = (item.ingredients || []).filter((i) => i !== ingredient);
    try {
      await new Promise<void>((resolve, reject) => {
        Meteor.call(
          "items.updateItemIngredients",
          itemName,
          updated,
          (error: Meteor.Error) => (error ? reject(error) : resolve())
        );
      });
    } catch (error) {
      alert(
        "Error deleting ingredient: " +
          ((error as Meteor.Error).reason || (error as Error).message)
      );
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div
      className={`
        fixed inset-0 flex items-center justify-center z-[9999]
        transition-colors z-[1000]
        ${isOpen ? "visible bg-black/20" : "invisible"}
      `}
    >
      <div className="fixed inset-0 flex justify-center items-center pointer-events-none">
        <div className="bg-stone-100 rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto pointer-events-auto">
          <h2 className="text-xl font-bold mb-4 text-red-900">
            Edit Ingredients for {item.name}
          </h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-red-900">
                New Ingredient
              </label>
              <input
                type="text"
                placeholder="Add ingredient..."
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                disabled={isSubmitting}
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleAdd}
                className="px-6 py-2 text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#6f597b" }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add"}
              </button>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-2 text-red-900">
            Current Ingredients
          </h3>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {(item.ingredients || []).map((ing, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center bg-white rounded-lg px-3 py-2 shadow-sm"
              >
                <span className="text-red-900">{ing}</span>
                <button
                  type="button"
                  className="bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                  title="Delete ingredient"
                  onClick={() => setDeleteTarget(ing)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-500"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </button>
              </li>
            ))}
            {(!item.ingredients || item.ingredients.length === 0) && (
              <li className="text-sm text-gray-500">No ingredients yet.</li>
            )}
          </ul>
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        message={`Are you sure you want to delete "${deleteTarget}"?`}
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AddIngredientModal;
