import React, { useState, useEffect, FormEvent } from "react";
import { Meteor } from "meteor/meteor";
import { Modal } from "./Modal";
import { MenuItem } from "/imports/api/menuItems/MenuItemsCollection";
import { IngredientDropdown } from "./IngredientDropdown";
import { CategoryDropdown } from "./CategoryDropdown";
import { AllergenDropdown } from "./AllergenDropdown";
import { ConfirmModal } from "./ConfirmModal";

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
    const [categories, setCategories ] = useState<string[]>([]);
    const [allergens, setAllergens] = useState<string[]>([]);
    const [discount, setDiscount] = useState(0);
    const [showConfirmation, setShowConfirmation ] = useState(false);
    const [confirm, setConfirm] = useState<"cancel" | "save" | null>(null);


    useEffect(() => {
    if (item) {
        setName(item.name);
        setPrice(item.price);
        setAvailable(item.available);
        setIngredients(item.ingredients || []);
        setCategories(item.category || []);
        setAllergens(item.allergens || []);
        setDiscount(item.discount || 0);
    }
    }, [item]);

    const handleSubmit = (e?: FormEvent) => {
        if (e) e.preventDefault();

        if (!item || !item.name || !item._id ) return;

        Meteor.call(
            "menuItems.update",
            item.name,
            {
                name,
                price,
                ingredients,
                category: categories,
                allergens,
                discount,
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
                        category: categories,
                        allergens,
                        discount,
                        available
                    });
                    onClose();
                }
            }
        )
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
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">Edit Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">Name</label>
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
            <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">Price</label>
            <input
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => {
                const val = parseFloat(e.target.value);
                setPrice(isNaN(val) ? 0 : val);
                }}
                onBlur={() => setPrice(parseFloat(price.toFixed(2)))}
                className="bg-press-up-purple border-2 border-press-up-purple text-white text-sm rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 block w-full p-2.5 placeholder-purple-200 
                dark:bg-press-up-purple dark:border-press-up-purple dark:placeholder-purple-200 dark:text-white dark:focus:ring-purple-400 dark:focus:border-purple-400"
                required
            />
            </div>

            <div>
            <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">Discount (%)</label>
            <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={discount}
                onChange={(e) => {
                const val = parseInt(e.target.value);
                setDiscount(isNaN(val) ? 0 : Math.min(100, val));
                }}
                className="bg-press-up-purple border-2 border-press-up-purple text-white text-sm rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 block w-full p-2.5 placeholder-purple-200 
                dark:bg-press-up-purple dark:border-press-up-purple dark:placeholder-purple-200 dark:text-white dark:focus:ring-purple-400 dark:focus:border-purple-400"
            />
            </div>

            {discount > 0 && (
            <div className="text-sm text-red-900 dark:text-white">
                <span className="line-through opacity-50 mr-2">
                ${price.toFixed(2)}
                </span>
                <span className="font-semibold">
                ${(price * (1 - discount / 100)).toFixed(2)}
                </span>
            </div>
            )}

            <IngredientDropdown
                selectedIngredients={ingredients}
                onChange={setIngredients}
                initialIngredients = {["Milk", "Flour", "Eggs", "Bread", "Butter", "Strawberries", "Avocado", "Bacon", "Olive Oil", "Paprika", "Jam"]}
            />

            <CategoryDropdown
                selectedCategories={categories}
                onChange={setCategories}
                initialCategories = {["Food", "Drink", "Dessert"]}
            />

            <AllergenDropdown
                selectedAllergen={allergens}
                onChange={setAllergens}
                initialAllergens = {["Gluten", "Dairy", "Nuts"]}
            />

            <div>
            <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">Available</label>
            <button
                type="button"
                onClick={() => setAvailable(!available)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-press-up-purple ${
                available ? "bg-press-up-purple" : "bg-gray-300"
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
                className="bg-press-up-purple hover:bg-press-up-purple text-white px-4 py-2 rounded-lg"
                >
                    Add Image
                </button>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <button
                type="button"
                onClick={ () => {
                    setConfirm("cancel");
                    setShowConfirmation(true);
                }}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg"
                >
                Cancel
                </button>

                <button
                type="button"
                onClick={ () => {
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
        message={ confirm === "cancel" ?
            "Discard changes?":
            "Save changes?"}
        onConfirm={() => {
            if ( confirm === "cancel") {
                onClose();
            } else if ( confirm === "save" ) {
                handleSubmit();
            }
            setShowConfirmation(false);
            setConfirm(null);
        }}
        onCancel={ () => {
            setShowConfirmation(false);
            setConfirm(null);
        }}
    />
    </>
  );
};

