import { Meteor } from "meteor/meteor";
import { useTracker, useSubscribe } from "meteor/react-meteor-data";
import { FormEvent, useEffect, useState } from "react";
import {
  PurchaseOrder,
  StockItem,
  StockItemsCollection,
  Supplier,
} from "/imports/api";

interface PurcahseOrderFormProps {
  onSuccess: () => void;
  supplier: Supplier;
}

export const PurchaseOrderForm = ({
  onSuccess,
  supplier,
}: PurcahseOrderFormProps) => {
  useSubscribe("stockItems.all");
  const stockItems: { [index: string]: StockItem } = useTracker(() => {
    const queryResult = StockItemsCollection.find(
      { supplier: supplier._id },
      { sort: { name: 1 } },
    ).fetch();
    let result: { [index: string]: StockItem } = {};
    for (let stockItem of queryResult) {
      result[String(stockItem._id)] = stockItem;
    }
    return result;
  }, [supplier]);

  const [stockItem, setStockItem] = useState<StockItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cost, setCost] = useState(0);

  useEffect(() => {
    setStockItem(null);
    setQuantity(1);
    setCost(0);
  }, [supplier]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (
      !stockItem ||
      !stockItem._id ||
      isNaN(quantity) ||
      quantity < 0 ||
      isNaN(cost) ||
      cost < 0
    ) {
      alert("Please fill in all fields correctly.");
      return;
    }

    const purchaseOrder: Omit<PurchaseOrder, "date"> = {
      stockItem: stockItem._id,
      quantity,
      cost,
    };

    Meteor.call(
      "purchaseOrders.insert",
      purchaseOrder,
      (error: Meteor.Error | undefined) => {
        if (error) {
          alert("Error: " + error.reason);
        } else {
          setStockItem(null);
          setQuantity(1);
          setCost(0);
          onSuccess();
        }
      },
    );
  };

  return (
    <div>
      <div className="flex items-center justify-center p-4 w-100 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
        <h3 className="text-xl font-semibold text-rose-400 dark:text-white">
          New Purchase Order
        </h3>
      </div>
      <div className="p-4 md:p-5">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
              Supplier
            </label>
            <input
              type="text"
              value={supplier.name}
              placeholder="0"
              className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
              disabled
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
              Item Name
            </label>
            <select
              onChange={(e) => setStockItem(stockItems[e.target.value] ?? null)}
              className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
              required
              disabled={!stockItems || Object.keys(stockItems).length <= 0}
            >
              <option value="">
                {stockItems && Object.keys(stockItems).length > 0
                  ? "--Select good--"
                  : "No associated goods..."}
              </option>
              {Object.values(stockItems).map((item, i) => (
                <option value={String(item._id)} key={i}>
                  {item.name}
                </option>
              ))}
            </select>
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
              placeholder="0"
              className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
              Cost
            </label>
            <input
              type="number"
              min="0.00"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              placeholder="0.00"
              className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
              required
            />
          </div>
          <div className="grid grid-cols-1 p-4">
            <button
              type="submit"
              className="ease-in-out transition-all duration-300 shadow-lg/20 cursor-pointer ml-4 text-white bg-rose-400 hover:bg-rose-500 focus:drop-shadow-none focus:ring-2 focus:outline-none focus:ring-rose-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-rose-300 dark:hover:bg-rose-400 dark:focus:ring-rose-400"
            >
              Create Purchase Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
