import React, { useState, useEffect, useRef } from "react";
import { StockItem } from "/imports/api/stockItems/StockItemsCollection";

interface StockItemProps {
  selectedStockItem: StockItem[];
  onChange: (stockItems: StockItem[]) => void;
  initialStockItems?: StockItem[];
}

export const StockItemDropdown: React.FC<StockItemProps> = ({
  selectedStockItem,
  onChange,
  initialStockItems = [],
}) => {
  const [allStockItems, setAllStockItems] =
    useState<StockItem[]>(initialStockItems);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchStockItem, setSearchStockItem] = useState("");

  const updateStockItems = (stockItem: StockItem) => {
    if (selectedStockItem.includes(stockItem)) {
      onChange(selectedStockItem.filter((i) => i !== stockItem));
    } else {
      onChange([...selectedStockItem, stockItem]);
    }
  };

  const searchStockItemList = allStockItems.filter((stockItem) =>
    stockItem.name.toLowerCase().includes(searchStockItem.toLowerCase()),
  );

  const deleteStockItem = (stockItem: StockItem | null) => {
    if (!stockItem) return;

    setAllStockItems((previous) =>
      previous.filter((item) => item !== stockItem),
    );
    if (selectedStockItem.includes(stockItem)) {
      onChange(selectedStockItem.filter((item) => item !== stockItem));
    }
  };

  useEffect(() => {
    setSearchStockItem("");
  }, [initialStockItems, selectedStockItem]);

  // to close dropdown with an outside click
  useEffect(() => {
    const handleClickToClose = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickToClose);
    return () => {
      document.removeEventListener("mousedown", handleClickToClose);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={searchStockItem}
        onChange={(e) => setSearchStockItem(e.target.name)}
        className="border rounded p-2 w-full"
        placeholder="--Search StockItems--"
        onFocus={() => setShowDropdown(true)}
      />
      {showDropdown && (
        // displaying the StockItems within dropdown
        <ul className="z-10 absolute bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white max-h-48 overflow-y-auto">
          {searchStockItemList.length > 0 ? (
            searchStockItemList.map((stockItem) => (
              <li
                key={stockItem._id}
                className="flex p-2 hover:bg-gray-200 rounded justify-between items-center"
              >
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStockItem.includes(stockItem)}
                    onChange={() => updateStockItems(stockItem)}
                  />
                  {stockItem.name}
                  {/* for deleting a stock item */}
                  <button
                    type="button"
                    className="text-red-500 hover:bg-red-100 rounded-full w-5 h-5 flex items-center justify-center ml-4"
                    title="Delete stock item"
                    onClick={() => {
                      deleteStockItem(stockItem);
                    }}
                  >
                    x
                  </button>
                </label>
              </li>
            ))
          ) : (
            <span>No inventory items.</span>
          )}
        </ul>
      )}
    </div>
  );
};
