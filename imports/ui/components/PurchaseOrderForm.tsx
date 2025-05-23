import { Meteor } from "meteor/meteor";
import { useTracker, useSubscribe } from "meteor/react-meteor-data";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import {
  PurchaseOrder,
  StockItem,
  StockItemLine,
  StockItemsCollection,
  Supplier,
} from "/imports/api";

interface PurchaseOrderFormProps {
  onSuccess: (purchaseOrder: Omit<PurchaseOrder, "date">) => void;
  supplier: Supplier;
}

export const PurchaseOrderForm = ({
  onSuccess,
  supplier,
}: PurchaseOrderFormProps) => {
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

  const costRegex = /^([1-9][0-9]*|0)?(\.[0-9]{0,2})?$/;
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

  const totalCost = (qty: string | number, cost: string | number) => {
    qty = Number(qty);
    cost = Number(cost);
    if (isNaN(qty) || isNaN(cost)) return "";

    return "$" + (qty * cost).toFixed(2);
  };

  const clearForm = () => {
    setStockItems([]);
    setSelectedStockItem(null);
    setQuantityStr("");
    setCostStr("");
  };

  useEffect(() => {
    clearForm();
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
          clearForm();
          onSuccess(purchaseOrder);
        }
      },
    );
  };

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });

  return (
    <div className="flex flex-col space-y-5 p-2" ref={printRef}>
      <div className="grid grid-cols-2">
        <div>
          {/* TODO: Information about company */}
          <div className="font-bold pb-2">Example Company Name</div>
          <div>123 Street Name</div>
          <div>City Name, 3170</div>
          <div>
            <span className="font-bold">Phone:</span> +...
          </div>
        </div>
        <div className="text-5xl text-nowrap text-right text-[#6F597B] print:hidden">
          New Purchase Order
        </div>
      </div>
      <div className="p-2 grid grid-cols-2 bg-gray-300">
        <div>
          <div className="font-bold underline pb-2 text-lg">Vendor</div>
          <div className="font-bold">{supplier.name}</div>
          {supplier.address ? <div>Address: {supplier.address}</div> : ""}
          {supplier.phone ? (
            <div>
              <span className="font-bold">Phone:</span> {supplier.phone}
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="text-right">
          <div>
            <span className="font-bold">Purchase Order #:</span> 94738285
          </div>
          <div>
            <span className="font-bold">Date:</span> 06/05/2025
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 overflow-auto max-h-50 print:overflow-visible print:h-auto">
        {/* Headers */}
        <div className="col-span-5 border-b-2 border-b-black border-r-1 border-r-[#6F597B] sticky z-1 top-0 bg-stone-100">
          Item
        </div>
        <div className="col-span-2 border-b-2 border-black px-2 border-r-1 border-r-[#6F597B] text-center sticky z-1 top-0 bg-stone-100">
          Quantity
        </div>
        <div className="col-span-2 border-b-2 border-black px-2 border-r-1 border-r-[#6F597B] text-center sticky z-1 top-0 bg-stone-100">
          Unit Cost
        </div>
        <div className="col-span-2 border-b-2 border-black px-2 border-r-1 border-r-[#6F597B] text-center sticky z-1 top-0 bg-stone-100">
          Total Cost
        </div>
        <div className="border-b-2 border-black px-2 text-center sticky z-1 top-0 bg-stone-100"></div>
        {/* Form Section */}
        <div className="col-span-5 border-b-1 border-b-[#F4E2E3] border-r-1 border-r-[#6F597B] flex items-center print:hidden">
          <select
            onChange={(e) =>
              setSelectedStockItem(availableStockItems[e.target.value])
            }
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
                ? "Select Item"
                : "No associated goods available..."}
            </option>
            {Object.values(availableStockItems).map((item, i) => (
              <option value={String(item._id)} key={i}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2 border-b-1 border-b-[#F4E2E3] px-2 border-r-1 border-r-[#6F597B] flex items-center justify-center print:hidden">
          <input
            type="text"
            pattern={quantityRegex.source}
            inputMode="numeric"
            value={quantityStr}
            onChange={(e) =>
              quantityRegex.test(e.target.value) &&
              setQuantityStr(e.target.value)
            }
            className="w-16 text-center"
            placeholder="0"
            required
          />
        </div>
        <div className="col-span-2 border-b-1 border-b-[#F4E2E3] px-2 border-r-1 border-r-[#6F597B] flex items-center justify-center print:hidden">
          <input
            type="text"
            pattern={costRegex.source}
            inputMode="numeric"
            value={costStr}
            onChange={(e) =>
              costRegex.test(e.target.value) && setCostStr(e.target.value)
            }
            className="w-16 text-center"
            placeholder="0.00"
            required
          />
        </div>
        <div className="col-span-2 border-b-1 border-b-[#F4E2E3] px-2 border-r-1 border-r-[#6F597B] flex items-center justify-center truncate print:hidden">
          {totalCost(quantityStr, costStr)}
        </div>
        <div className="border-b-1 border-b-[#F4E2E3] px-2 flex items-center justify-center print:hidden">
          <button
            className="m-2 ease-in-out transition-all duration-300 shadow-lg/20 cursor-pointer ml-4 text-white bg-green-500 hover:bg-green-600 focus:drop-shadow-none focus:ring-2 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-600 print:hidden"
            onClick={() => {
              addStockItemLine();
            }}
          >
            +
          </button>
        </div>
        {/* Goods */}
        {stockItems.map((stockItemLine, i) => (
          <>
            <div
              className="col-span-5 border-b-1 border-b-[#F4E2E3] border-r-1 border-r-[#6F597B] flex items-center"
              key={`ssiname-${i}`}
            >
              {availableStockItems[String(stockItemLine.stockItem)].name}
            </div>
            <div
              className="col-span-2 border-b-1 border-b-[#F4E2E3] px-2 border-r-1 border-r-[#6F597B] flex items-center justify-center"
              key={`ssiqty-${i}`}
            >
              {stockItemLine.quantity}
            </div>
            <div
              className="col-span-2 border-b-1 border-b-[#F4E2E3] px-2 border-r-1 border-r-[#6F597B] flex items-center justify-center"
              key={`ssicost-${i}`}
            >
              {stockItemLine.cost}
            </div>
            <div
              className="col-span-2 border-b-1 border-b-[#F4E2E3] px-2 border-r-1 border-r-[#6F597B] flex items-center justify-center truncate"
              key={`ssitotalcost-${i}`}
            >
              {totalCost(stockItemLine.quantity, stockItemLine.cost)}
            </div>
            <div
              className="border-b-1 border-b-[#F4E2E3] px-2 flex items-center justify-center"
              key={`ssidel-${i}`}
            >
              <button
                className="m-2 ease-in-out transition-all duration-300 shadow-lg/20 cursor-pointer ml-4 text-white bg-red-400 hover:bg-red-500 focus:drop-shadow-none focus:ring-2 focus:outline-none focus:ring-red-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-300 dark:hover:bg-red-400 dark:focus:ring-red-400 print:hidden"
                onClick={() =>
                  setStockItems((prev) =>
                    prev.filter(
                      (s) =>
                        s.stockItem != stockItemLine.stockItem &&
                        s.cost != stockItemLine.cost,
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
      {/* Totals */}
      <div className="grid grid-cols-12 max-h-50 text-right">
        <div className="col-span-7 text-left flex items-end">
          <button className="text-nowrap justify-self-end shadow-lg/20 ease-in-out transition-all duration-300 p-1 m-4 ml-auto rounded-xl px-3 bg-[#A43375] text-white cursor-pointer w-right-2 hover:bg-rose-500 print:hidden">
            Save PO
          </button>
          <button onClick={handlePrint} className="text-nowrap justify-self-end shadow-lg/20 ease-in-out transition-all duration-300 p-1 m-4 ml-auto rounded-xl px-3 bg-[#A43375] text-white cursor-pointer w-right-2 hover:bg-rose-500 print:hidden">
            Print
          </button>
          <div className="flex-1"></div>
        </div>
        <div className="col-span-2 flex flex-col">
          <div className="font-bold">Subtotal:</div>
          <div className="font-bold">Discount:</div>
          <div className="font-bold">Tax Rate:</div>
          <div className="font-bold">Tax:</div>
          <div className="font-bold text-lg mt-2">Total:</div>
        </div>
        <div className="col-span-2 flex flex-col">
          <div>
            $
            {stockItems
              .map((s) => s.quantity * s.cost)
              .reduce((a, v) => a + v, 0)
              .toFixed(2)}
          </div>
          <div>0%</div>
          <div>0%</div>
          <div>$0.00</div>
          <div className="text-lg mt-2">
            $
            {stockItems
              .map((s) => s.quantity * s.cost)
              .reduce((a, v) => a + v, 0)
              .toFixed(2)}
          </div>
        </div>
        <div className="col-span-1"></div>
      </div>
    </div>
  );
};
