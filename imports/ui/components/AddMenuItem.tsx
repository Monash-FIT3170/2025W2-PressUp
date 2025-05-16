import { FormEvent, useEffect, useState } from "react";
import { Meteor } from "meteor/meteor";
import { MenuItem } from "/imports/api";
import { Modal } from "./Modal";

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    //item: MenuItem | null;
    //onSave: (updatedItem: <MenuItem>) => void;
}

export const AddMenuItem: React.FC<AddItemModalProps> = ({
    isOpen,
    onClose,
    //onSave,
}) => {
    const [itemName, setItemName] = useState("");
    const [itemPrice, setItemPrice] = useState<number>(0);
    const [itemIngredients, setItemIngredients] = useState<string[]>([""]);
    const [itemCategory, setItemCategory] = useState<string[]>([""]);
    const [itemDiscount, setItemDiscount] = useState<number>(0);
    const [availableIngredients, setAvailableIngredients] = useState<string[]>([""]);
    const [availableCategories, setAvailableCategories] = useState<string[]>([""]);


    const updateItemIngredients = (newIngredient: string) => {
        var currentIngredients = itemIngredients;
        currentIngredients.push(newIngredient);

        setItemIngredients(currentIngredients);
    }

    const updateItemCategory = (newCategory: string) => {
        var currentCategory = itemCategory;
        currentCategory.push(newCategory);

        setItemCategory(currentCategory);
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        var item: MenuItem = {
            name: itemName,
            quantity: 1,
            ingredients: itemIngredients,
            available: true,
            price: itemPrice,
            category: itemCategory,
        }

        Meteor.call(
            "menuItems.insert",
            item,
            (error: Meteor.Error | undefined) => {
                if (error) {
                    console.error("Error updating item:", error);
                }
                onClose();
            }
        )

        if (!item) return;

    };

    useEffect(() => {
        var ingredients = ["Milk", "Flour", "Eggs", "Bread", "Butter", "Strawberries", "Avocado", "Bacon", "Olive Oil", "Paprika", "Jam"];
        var categories = ["Breakfast","Lunch","Hot Drinks","Iced Drinks","Pastries"];
        setAvailableIngredients(ingredients);
        setAvailableCategories(categories);
    }, []);

    return (
        <Modal open={isOpen} onClose={onClose}>
            <div className="p-4 md:p-5 max-h-[80vh] overflow-y-auto w-full">
                <h2 className="text-xl font-semibold text-rose-400 mb-4">Edit Item</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">Item Name</label>
                        <input
                            type="text"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
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
                            value={itemPrice}
                            onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                            className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">Ingredients</label>
                        <select
                        onChange={(e) => updateItemIngredients(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
                        required
                    >
                        <option value="">--Select Ingredient--</option>
                        {availableIngredients.map((ingredient, i) => (
                            <option value={ingredient} key={i}>
                                {ingredient}
                            </option>
                        ))}
                    </select>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">Category</label>
                        <select
                        onChange={(e) => updateItemCategory(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
                        required
                    >
                        <option value="">--Select Category--</option>
                        {availableCategories.map((category, i) => (
                            <option value={category} key={i}>
                                {category}
                            </option>
                        ))}
                    </select>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">Discount</label>
                        <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={itemDiscount}
                            onChange={(e) => setItemDiscount(parseFloat(e.target.value) || 0)}
                            className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:text-white"
                        />
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
            </div >
        </Modal >
    );
};

