import {
  FormEvent,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
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

// 👇 Expose internal submit method to parent
export const AddItemForm = forwardRef(
  ({ onSuccess }: { onSuccess: () => void }, ref) => {
    const [itemName, setItemName] = useState("");
    const [quantity, setQuantity] = useState<number>(0);
    const [location, setLocation] = useState("");
    const [supplier, setSupplier] = useState("");

    const submitForm = () => {
      Meteor.call(
        "stockItems.insert",
        {
          name: itemName,
          quantity,
          location,
          supplier,
        },
        (error: Meteor.Error | undefined) => {
          if (error) {
            alert("Error: " + error.reason);
          } else {
            setItemName("");
            setQuantity(0);
            setLocation("");
            setSupplier("");
            onSuccess(); // close modal
          }
        }
      );
    };

    useImperativeHandle(ref, () => ({
      submitForm,
    }));

    const handleSubmit = (e: FormEvent) => {
      e.preventDefault();
      submitForm();
    };

    return (
      <div>
        <div className="flex items-center justify-center p-4 w-100 md:p-5 border-b rounded-t border-gray-200">
          <h3 className="text-xl font-semibold text-rose-400 dark:text-white">
            New Stock Item
          </h3>
        </div>
        <div className="p-4 md:p-5">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-2 text-sm font-medium text-red-900">
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
              <label className="block mb-2 text-sm font-medium text-red-900">
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
              <label className="block mb-2 text-sm font-medium text-red-900">
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
              <label className="block mb-2 text-sm font-medium text-red-900">
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
            {/* 👇 Removed native submit button */}
          </form>
        </div>
      </div>
    );
  }
);
