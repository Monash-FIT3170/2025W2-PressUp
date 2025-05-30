import React, { useState, useEffect } from "react";
import { Meteor } from "meteor/meteor";

interface ItemCategory {
  _id: string;
  name: string;
}

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    Meteor.call("itemCategories.getAll", (err: Meteor.Error, result?: ItemCategory[]) => {
      setLoading(false);
      if (err) {
        console.error("Failed to fetch categories:", err);
      } else if (result) {
        setCategories(result);
      }
    });
  }, [isOpen]);

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;

    Meteor.call("itemCategories.add", trimmed, (err: Meteor.Error) => {
      if (err) {
        console.error("Failed to add category:", err);
      } else {
        setNewCategory("");
        Meteor.call("itemCategories.getAll", (err2: Meteor.Error, result?: ItemCategory[]) => {
          if (!err2 && result) {
            setCategories(result);
          }
        });
      }
    });
  };

  const handleDeleteCategory = (name: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    Meteor.call("itemCategories.delete", name, (err: Meteor.Error) => {
      if (err) {
        console.error("Failed to delete category:", err);
      } else {
        setCategories((prev) => prev.filter(cat => cat.name !== name));
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-press-up-purple rounded-lg p-6 w-96 max-w-full shadow-lg max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-black dark:text-white mb-5">Manage Categories</h2>

        {loading ? (
          <p className="text-black dark:text-white">Loading categories...</p>
        ) : (
          <ul className="mb-6 max-h-48 overflow-auto border border-gray-300 dark:border-press-up-purple rounded">
            {categories.length === 0 && <p className="p-4 text-gray-500 dark:text-purple-200">No categories found.</p>}
            {categories.map((cat) => (
              <li
                key={cat.name}
                className="flex justify-between items-center py-2 px-3 border-b border-gray-200 dark:border-press-up-purple text-black dark:text-white"
              >
                <span>{cat.name}</span>
                <button
                  onClick={() => handleDeleteCategory(cat.name)}
                  className="text-red-600 hover:text-red-800 text-sm font-semibold"
                  aria-label={`Delete category ${cat.name}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex space-x-3 mb-6">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category"
            className="flex-grow bg-press-up-purple dark:bg-press-up-purple border-2 border-press-up-purple text-white rounded-lg px-3 py-2 text-sm placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
          />
          <button
            onClick={handleAddCategory}
            className="bg-press-up-purple hover:bg-press-up-purple text-white font-semibold px-5 py-2 rounded-lg text-sm transition-shadow shadow-sm hover:shadow-md"
          >
            Add
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-5 py-2 rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryModal;


