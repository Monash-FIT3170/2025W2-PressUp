import { Meteor } from "meteor/meteor";
import { useTracker, useSubscribe } from "meteor/react-meteor-data";
import { FormEvent, useEffect, useState } from "react";
import { SuppliersCollection, StockItem } from "/imports/api";
import { IdType } from "/imports/api/database";
import { Button } from "./interaction/Button";

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  item?: StockItem | null;
}

export const AddItemForm = ({ onSuccess, item }: Props) => {
  useSubscribe("suppliers");
  const suppliers = useTracker(
    () => SuppliersCollection.find({}, { sort: { name: 1 } }).fetch(),
    [],
  );

  const [itemName, setItemName] = useState(item?.name ?? "");
  const [quantity, setQuantity] = useState<string>(
    item ? String(item.quantity) : "",
  );
  const [location, setLocation] = useState(item?.location ?? "");
  const [supplier, setSupplier] = useState<IdType | null>(
    item?.supplier ?? null,
  );
  const [selectedValue, setSelectedValue] = useState<string>(
    item?.supplier ? String(item.supplier) : "",
  );

  useEffect(() => {
    setItemName(item?.name ?? "");
    setQuantity(item ? String(item.quantity) : "");
    setLocation(item?.location ?? "");

    const supplierId = item?.supplier ?? "";
    setSupplier(supplierId || null);
    setSelectedValue(supplierId);
  }, [item]);

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
        },
      );
    } else {
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
        },
      );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center p-4 w-100 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
        <h3 className="text-xl font-semibold text-press-up-purple dark:text-white">
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
              value={selectedValue}
              onChange={(e) => {
                setSelectedValue(e.target.value);
                if (e.target.value === "") {
                  setSupplier(null);
                } else {
                  const found = suppliers.find(
                    (s) => String(s._id) === e.target.value,
                  );
                  setSupplier(found && found._id ? found._id : null);
                }
              }}
              className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
              required
            >
              <option value="">--Select supplier--</option>
              {suppliers
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((supplier, i) => (
                  <option value={String(supplier._id)} key={i}>
                    {supplier.name}
                  </option>
                ))}
            </select>
          </div>
          {!item && (
            <div className="grid grid-cols-1 p-4">
              <Button
                variant="positive"
                >
                Add Item
              </Button>
            </div>
          )}
          {item && (
            <div className="grid grid-cols-1 p-4">
              <Button
                variant="positive"
                >
                Save Item
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
