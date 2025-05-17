import React, { useState, useEffect, FormEvent } from "react";
import { Meteor } from "meteor/meteor";
import { Modal } from "./Modal";
import { MenuItem } from "/imports/api/menuItems/MenuItemsCollection";
import { IngredientDropdown } from "./IngredientDropdown";

interface EditItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: MenuItem | null;
    onSave: (updatedItem: Partial<MenuItem>) => void;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
    isOpen,
    onClose,
    item,
    onSave,
}) => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [available, setAvailable] = useState(false);
    const [ingredients, setIngredients] = useState<string[]>([]);

     useEffect(() => {
        if (item) {
            setName(item.name);
            setPrice(item.price);
            setAvailable(item.available);
            setIngredients(item.ingredients || []);
        }
    }, [item]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        if (!item || !item.name || !item._id ) return;
        
        Meteor.call(
            "menuItems.update",
            item.name,
            {
                name,
                price,
                ingredients,
                available
            },
            (error: Meteor.Error | undefined ) => {
                if (error) {
                    console.error("Error updating item:", error);
                } else {
                    onSave({
                        _id: item._id,
                        name,
                        price,
                        ingredients,
                        available
                    });
                    onClose();
                }
            }
        )
    };

    return (
        <Modal open={isOpen} onClose={onClose}>
        <div className="p-4 md:p-5 max-h-[80vh] overflow-y-auto w-full">
            <h2 className="text-xl font-semibold text-rose-400 mb-4">Edit Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">Name</label>
                <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
                required
                />
            </div>

            <div>
                <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">Price</label>
                <input
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:text-white"
                required
                />
            </div>

            <IngredientDropdown
                selectedIngredients={ingredients}
                onChange={setIngredients}
                initialIngredients = {["Milk", "Flour", "Eggs", "Bread", "Butter", "Strawberries", "Avocado", "Bacon", "Olive Oil", "Paprika", "Jam"]}
            />

            <div>
            <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">Available</label>
            <button
                type="button"
                onClick={() => setAvailable(!available)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                available ? "bg-rose-400" : "bg-gray-300"
                }`}
            >
                <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    available ? "translate-x-6" : "translate-x-1"
                }`}
                />

            </button>
            </div>

            <div className = "flex justify-start">
                <button
                type="button"
                onClick={ () => {}}
                className="bg-rose-400 hover:bg-rose-500 text-white px-4 py-2 rounded-lg"
                >
                    Add Image
                </button>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg"
                >
                Cancel
                </button>
                <button
                type="submit"
                className="bg-rose-400 hover:bg-rose-500 text-white px-4 py-2 rounded-lg"
                >
                Save
                </button>
            </div>
            </form>
        </div>
    </Modal>
  );
};
  
