import { Meteor } from "meteor/meteor";
import { useTracker, useSubscribe } from "meteor/react-meteor-data";
import { FormEvent, useEffect, useState } from "react";
import {
  PurchaseOrder,
  StockItem,
  StockItemLine,
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
  const availableStockItems: { [index: string]: StockItem } = useTracker(() => {
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

  const [stockItems, setStockItems] = useState<StockItemLine[]>([]);
  const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(
    null,
  );
  const [quantityStr, setQuantityStr] = useState<string>("");
  const [costStr, setCostStr] = useState<string>("");

  const costRegex = /^[0-9]*(\.[0-9]{0,2})?$/;
  const quantityRegex = /^[0-9]*$/;

  const addStockItemLine = () => {
    const stockItemId = selectedStockItem?._id;
    const quantity = Number(quantityStr);
    const cost = Number(costStr);

    if (
      !stockItemId ||
      isNaN(quantity) ||
      quantity < 0 ||
      isNaN(cost) ||
      cost < 0
    ) {
      alert("Please fill in all fields correctly.");
      return;
    }

    setStockItems((prev) => {
      const existingIndex = prev.findIndex(
        (v) => v.stockItem == stockItemId && v.cost == cost,
      );
      if (existingIndex != -1) {
        const existingStockItemLine = prev[existingIndex];
        const newStockItemLine = {
          ...existingStockItemLine,
          quantity: existingStockItemLine.quantity + quantity,
        };
        return [
          ...prev.slice(0, existingIndex),
          newStockItemLine,
          ...prev.slice(existingIndex + 1),
        ];
      }

      return [{ stockItem: stockItemId, quantity, cost }, ...prev];
    });
  };

  const clearFields = () => {
    setStockItems([]);
    setSelectedStockItem(null);
    setQuantityStr("");
    setCostStr("");
  };

  useEffect(() => {
    clearFields();
  }, [supplier]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (stockItems.length == 0) {
      alert("Please add at least one good.");
      return;
    }

    const purchaseOrder: Omit<PurchaseOrder, "date"> = {
      stockItems,
    };

    Meteor.call(
      "purchaseOrders.insert",
      purchaseOrder,
      (error: Meteor.Error | undefined) => {
        if (error) {
          alert("Error: " + error.reason);
        } else {
          clearFields();
          onSuccess();
        }
      },
    );
  };

  return (
    <div>
      <div className="flex items-center justify-center p-4 w-full md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
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
              Add Goods
            </label>
            <select
              onChange={(e) =>
                setSelectedStockItem(availableStockItems[e.target.value])
              }
              className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
              required
              disabled={
                !availableStockItems ||
                Object.keys(availableStockItems).length <= 0
              }
              value={selectedStockItem ? String(selectedStockItem._id) : ""}
            >
              <option value="">
                {availableStockItems &&
                  Object.keys(availableStockItems).length > 0
                  ? "--Select good--"
                  : "No associated goods..."}
              </option>
              {Object.values(availableStockItems).map((item, i) => (
                <option value={String(item._id)} key={i}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-row space-x-4">
            <input
              type="text"
              pattern={quantityRegex.source}
              inputMode="numeric"
              value={quantityStr}
              onChange={(e) =>
                quantityRegex.test(e.target.value) &&
                setQuantityStr(e.target.value)
              }
              placeholder="Quantity"
              className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
              required
            />
            <input
              type="text"
              pattern={costRegex.source}
              inputMode="numeric"
              value={costStr}
              onChange={(e) =>
                costRegex.test(e.target.value) && setCostStr(e.target.value)
              }
              placeholder="Cost"
              className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
              required
            />
            <button
              className="ease-in-out transition-all duration-300 shadow-lg/20 cursor-pointer ml-4 text-white bg-green-500 hover:bg-green-600 focus:drop-shadow-none focus:ring-2 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-600"
              onClick={(e) => {
                e.preventDefault();
                addStockItemLine();
              }}
            >
              +
            </button>
          </div>
          <div
            className={`dark:text-white items-center grid grid-cols-5 max-h-48 gap-2 overflow-auto ${stockItems.length > 0 && "pb-5"}`}
          >
            {stockItems.length > 0 && (
              <>
                <div className="col-span-2 font-bold">Good</div>
                <div className="font-bold">Quantity</div>
                <div className="font-bold">Cost</div>
                <div></div>
              </>
            )}
            {stockItems.map((stockItemLine, i) => (
              <>
                <div className="col-span-2" key={`ssiname-${i}`}>
                  {availableStockItems[String(stockItemLine.stockItem)].name}
                </div>
                <div key={`ssiqty-${i}`}>{stockItemLine.quantity}</div>
                <div key={`ssicost-${i}`}>{stockItemLine.cost}</div>
                <div key={`ssidel-${i}`}>
                  <button
                    className="ease-in-out transition-all duration-300 shadow-lg/20 cursor-pointer ml-4 text-white bg-red-400 hover:bg-red-500 focus:drop-shadow-none focus:ring-2 focus:outline-none focus:ring-red-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-300 dark:hover:bg-red-400 dark:focus:ring-red-400"
                    onClick={() =>
                      setStockItems((prev) =>
                        prev.filter(
                          (s) => s.stockItem != stockItemLine.stockItem,
                        ),
                      )
                    }
                  >
                    x
                  </button>
                </div>
              </>
            ))}
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
