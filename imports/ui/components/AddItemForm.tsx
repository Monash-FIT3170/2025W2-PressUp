import { FormEvent, useState } from "react";
import { Supplier } from "/imports/api/supplier";
import { Meteor } from "meteor/meteor";

const mockSuppliers = (amount: number) => {
  let result: Supplier[] = [];
  for (let i = 1; i < amount; i++) {
    result.push({ name: `Mock Supplier ${i}` });
  }
  return result;
};

const suppliers: Supplier[] = mockSuppliers(10);

export const AddItemForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState<string>("");
  const [location, setLocation] = useState("");
  const [supplier, setSupplier] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const parsedQuantity = parseInt(quantity, 10);
    if (!itemName || !location || !supplier || isNaN(parsedQuantity) || parsedQuantity < 0) {
      alert("Please fill in all fields correctly.");
      return;
    }

    Meteor.call(
      "stockItems.insert",
      {
        name: itemName,
        quantity: parsedQuantity,
        location,
        supplier,
      },
      (error: Meteor.Error | undefined) => {
        if (error) {
          alert("Error: " + error.reason);
        } else {
          setItemName("");
          setQuantity("");
          setLocation("");
          setSupplier("");
          onSuccess();
        }
      }
    );
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
              className="bg-gray-50 border border-gray-300 text-red-900 ..."
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
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-red-900 ..."
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
              Location
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-red-900 ..."
              placeholder="Storage Room 1"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
              Supplier
            </label>
            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-red-900 ..."
              required
            >
              <option value="">--Select supplier--</option>
              {suppliers.map((supplier) => (
                <option key={supplier.name} value={supplier.name}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="justify-self-end shadow-lg/20 ease-in-out transition-all duration-300 p-1 m-4 rounded-xl px-3 bg-rose-400 text-white cursor-pointer w-24 right-2 hover:bg-rose-500"
          >
            Add Item
          </button>
        </form>
      </div>
    </div>
  );
};
