import { Meteor } from "meteor/meteor";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { FormEvent, ChangeEvent, useEffect, useState } from "react";
import { Supplier, SuppliersCollection, StockItem } from "/imports/api";
import { Mongo } from "meteor/mongo";

export const AddItemForm = ({ onSuccess, onCancel, item }: { onSuccess: () => void; onCancel: () => void; item?: StockItem | null }) => {
  const [itemName, setItemName] = useState(item?.name ?? "");
  const [quantity, setQuantity] = useState<string>(item ? String(item.quantity) : "");
  const [location, setLocation] = useState(item?.location ?? "");
  const [supplier, setSupplier] = useState<Mongo.ObjectID | null>(item?.supplier ?? null);
  const [selectedValue, setSelectedValue] = useState<string>(item?.supplier ? String(item.supplier) : "");

  useEffect(() => {
    setItemName(item?.name ?? "");
    setQuantity(item ? String(item.quantity) : "");
    setLocation(item?.location ?? "");
    setSupplier(item?.supplier ?? null);
    setSelectedValue(item?.supplier ? String(item.supplier) : "");
  }, [item]);

  useSubscribe("suppliers") === false;
  const suppliers: Supplier[] = useTracker(() => {
    return SuppliersCollection.find().fetch();
  });

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(event.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const parsedQuantity = parseInt(quantity, 10);
    if (
      !itemName ||
      !location ||
      !supplier ||
      isNaN(parsedQuantity) ||
      parsedQuantity < 0
    ) {
      alert("Please fill in all fields correctly.");
      return;
    }

    if (item && item._id) {
      console.log("Updating item:", item._id);
      // Editing existing item
      Meteor.call(
        "stockItems.update",
        item._id,
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
            onSuccess();
          }
        }
      );
    } else {
      console.log("Else insert");
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
          setSupplier(null);
          onSuccess();
        }
      }
    );
    }
  };

    return (
    <div>
      <div className="flex items-center justify-center p-4 w-100 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
        <h3 className="text-xl font-semibold text-rose-400 dark:text-white">
          {item ? "Edit Stock Item" : "New Stock Item"}
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
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
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
              onChange={(e) => setSupplier(suppliers.find(s => e.target.value == String(s._id))?._id ?? null)}
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
          {!item && (
              <div className="grid grid-cols-1 p-4">
              <button
                type="submit"
                className="ease-in-out transition-all duration-300 shadow-lg/20 cursor-pointer ml-4 text-white bg-rose-400 hover:bg-rose-500 focus:drop-shadow-none focus:ring-2 focus:outline-none focus:ring-rose-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-rose-300 dark:hover:bg-rose-400 dark:focus:ring-rose-400"
              >
                Add Item
              </button>
            </div>
          )}
          {item && (
            <div className="grid grid-cols-2 p-4">
            <button
              type="button"
              onClick={onCancel}
              className="ease-in-out transition-all duration-300 shadow-lg/20 cursor-pointer mr-4 text-white bg-neutral-400 hover:bg-neutral-500 focus:drop-shadow-none focus:ring-2 focus:outline-none focus:ring-neutral-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-neutral-500 dark:hover:bg-neutral-600 dark:focus:ring-neutral-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ease-in-out transition-all duration-300 shadow-lg/20 cursor-pointer ml-4 text-white bg-rose-400 hover:bg-rose-500 focus:drop-shadow-none focus:ring-2 focus:outline-none focus:ring-rose-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-rose-300 dark:hover:bg-rose-400 dark:focus:ring-rose-400"
            >
              Save
            </button>
          </div>
        )}
        </form>
      </div>
    </div>
  );

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
};
