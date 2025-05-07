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

export const AddItemForm = () => {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [location, setLocation] = useState("");
  const [supplier, setSupplier] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    Meteor.call("stockItems.insert", {
      name: itemName,
      quantity,
      location,
      supplier,
    }, (error: Meteor.Error | undefined) => {
      if (error) {
        alert("Error: " + error.reason);
      } else {
        alert("Item added successfully!");
        // Clear form
        setItemName("");
        setQuantity(0);
        setLocation("");
        setSupplier("");
      }
    });
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
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="bg-gray-50 border border-gray-300 text-red-900 ..."
              placeholder="0"
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
            className="px-4 py-2 bg-rose-500 text-white rounded"
          >
            Add Item
          </button>
        </form>
      </div>
    </div>
  );
};
