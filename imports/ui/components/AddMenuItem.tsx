import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { FormEvent, useState } from "react";
import { Meteor } from "meteor/meteor";
import { MenuItem, Supplier, SuppliersCollection } from "/imports/api";
import { Mongo } from "meteor/mongo";

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

    useSubscribe("suppliers") === false;
    const suppliers: Supplier[] = useTracker(() => {
        return SuppliersCollection.find().fetch();
    });

    const updateItemIngredients = (newIngredient: string) => {
        var currentIngredients = itemIngredients;
        currentIngredients.push(newIngredient);

        setItemIngredients(currentIngredients);
    }

    // const handleSubmit = (e: FormEvent) => {
    //     e.preventDefault();

    //     const parsedQuantity = parseInt(itemPrice, 10);
    //     if (
    //         !itemName ||
    //         !itemIngredients ||
    //         !itemCategory ||
    //         isNaN(parsedQuantity) ||
    //         parsedQuantity < 0
    //     ) {
    //         alert("Please fill in all fields correctly.");
    //         return;
    //     }

    //     var menuItem: MenuItem = {
    //         name: itemName,
    //         quantity: parsedQuantity,
    //         ingredients: itemIngredients,
    //         available: true,
    //         price: itemPrice,
    //         category?: itemCategory,
    //     }

    //     Meteor.call(
    //         "stockItems.insert",
    //         {
    //             name: itemName,
    //             quantity: parsedQuantity,
    //             location: itemIngredients,
    //             supplier: itemCategory,
    //         },
    //         (error: Meteor.Error | undefined) => {
    //             if (error) {
    //                 alert("Error: " + error.reason);
    //             } else {
    //                 setItemName("");
    //                 setItemPrice(0);
    //                 setItemIngredients([""]);
    //                 setItemCategory([""]);
    //                 //onSave(menuItem);
    //             }
    //         },
    //     );
    // };


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

return (
    <div>
        <div className="flex items-center justify-center p-4 w-100 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
            <h3 className="text-xl font-semibold text-rose-400 dark:text-white">
                New Stock Item
            </h3>
        </div>
        <div className="p-4 md:p-5">
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
                        Item Name
                    </label>
                    <input
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
                        placeholder="Coffee"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
                        Quantity
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={itemPrice}
                        onChange={(e) => setItemPrice(parseInt(e.target.value))}
                        placeholder="0"
                        className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
                        Location
                    </label>
                    <input
                        value={itemIngredients}
                        onChange={(e) => updateItemIngredients(e.target.value)}
                        placeholder="Storage Room 1"
                        className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
                        Supplier
                    </label>
                    <select
                        onChange={(e) => setItemCategory(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
                        required
                    >
                        <option value="">--Select supplier--</option>
                        {suppliers.map((supplier, i) => (
                            <option value={String(supplier._id)} key={i}>
                                {supplier.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-1 p-4">
                    <button
                        type="submit"
                        className="ease-in-out transition-all duration-300 shadow-lg/20 cursor-pointer ml-4 text-white bg-rose-400 hover:bg-rose-500 focus:drop-shadow-none focus:ring-2 focus:outline-none focus:ring-rose-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-rose-300 dark:hover:bg-rose-400 dark:focus:ring-rose-400"
                    >
                        Add Menu Item
                    </button>
                </div>
            </form>
        </div>
    </div>
);
};
