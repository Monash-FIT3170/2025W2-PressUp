import { Mongo } from "meteor/mongo";
import { ChangeEvent, useEffect, useState } from "react";
import { Supplier } from "/imports/api";

interface AddItemFormProps {
  item?: StockItem | null; 
}

const mockSuppliers = (amount: number) => {
  let result: Supplier[] = [];
  for (let i = 1; i < amount; i++) {
    result.push({
      _id: new Mongo.ObjectID(),
      name: `Mock Supplier ${i}`,
      description: "",
      pastOrderQty: 1,
      goods: [],
    });
  }
  return result;
};

const suppliers: Supplier[] = mockSuppliers(10);

export const AddItemForm = ({ item }: AddItemFormProps) => {
  const [name, setName] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(0);
  const [location, setLocation] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<string>("");

  useEffect(() => {
    if (item) {
      setName(item.name);
      setQuantity(item.quantity);
      setLocation(item.location);
      setSelectedValue(item.supplier);
    }
  }, [item]);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(event.target.value);
  };

  return (
    <div>
      <div className="flex items-center justify-center p-4 w-100 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
        <h3 className="text-xl font-semibold text-rose-400 dark:text-white">
          {item ? "Edit Stock Item" : "New Stock Item"}
        </h3>
      </div>
      <div className="p-4 md:p-5">
        <form className="space-y-4" action="#">
          <div>
            <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
              Item Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="0"
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
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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
              value={selectedValue}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
            >
              <option value="">--Select supplier--</option>
              {suppliers.map((supplier, i) => (
                <option value={supplier.name} key={i}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>
    </div>
  );
};
