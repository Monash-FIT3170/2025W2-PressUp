import { MenuItemsCollection } from "/imports/api";
import { PosItemCard } from "../../components/PosItemCard";
import { useTracker, useSubscribe } from 'meteor/react-meteor-data';
import { PosSideMenu } from "../../components/PosSideMenu";
import { Meteor } from 'meteor/meteor';
import { useState } from "react";

export const MainDisplay = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const isLoadingPosItems = useSubscribe("menuItems")
    const posItems = useTracker( () => MenuItemsCollection.find().fetch());

    const filteredItems = posItems.filter((item) => {
      const matchesName = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategories.length === 0 ||
        (item.category && item.category.some(cat => selectedCategories.includes(cat)));
      const isAvailable = item.available === true;
      return matchesName && matchesCategory && isAvailable;
    });
    

    // Current order, hard coded table number at the moment
    const [order, setOrder] = useState({
      menuItems: [],
      totalPrice: 0,
      tableNo: 1,
    });

    // Update order status
    const updateOrder = (updatedItems) => {
      const newTotal = updatedItems.reduce(
        (sum, i) => sum + i.quantity * i.price,
        0
      );
      setOrder({
        ...order,
        menuItems: updatedItems,
        totalPrice: parseFloat(newTotal.toFixed(2)),
      });
    };

    const handleIncrease = (itemId) => {
      const updatedItems = order.menuItems.map((i) =>
        i._id === itemId ? { ...i, quantity: i.quantity + 1 } : i
      );
      updateOrder(updatedItems);
    };

    const handleDecrease = (itemId) => {
      const updatedItems = order.menuItems
        .map((i) =>
          i._id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0); // Remove if 0
      updateOrder(updatedItems);
    };

    const handleDelete = (itemId) => {
      const updatedItems = order.menuItems.filter(i => i._id !== itemId);
      updateOrder(updatedItems);
    };


    const toggleCategory = (category) => {
      if (selectedCategories.includes(category)) {
        setSelectedCategories(selectedCategories.filter((c) => c !== category));
      } else {
        setSelectedCategories([...selectedCategories, category]);
      }
    };
    
    const handleItemClick = (item) => {
      const existing = order.menuItems.find((i) => i._id === item._id);
      let updatedItems;

      // If item is already in order, increment quantity, otherwise add normally
      if (existing) {
        updatedItems = order.menuItems.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        updatedItems = [...order.menuItems, { ...item, quantity: 1 }];
      }

      // Calculate total price of order
      const newTotal = updatedItems.reduce(
        (sum, i) => sum + i.quantity * i.price,
        0
      );

      updateOrder(updatedItems);
    };

  return (
    <div className="flex flex-1 overflow-auto">
      {/* Main Left Section */}
      <div className="flex-1 p-4">
        {/* Search & Filter Section */}
        <div className="mb-4 space-y-2">
          {/* Search Bar */}
          <div id="search-bar">
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#1e032e]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5 text-gray-400 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex space-x-4">
            {["Food", "Drink", "Dessert"].map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors duration-200 ${
                  selectedCategories.includes(cat)
                    ? "bg-[#6f597b] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* POS Cards */}
        <div
          id="pos-display"
          className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
        >
          {filteredItems.map((item) => (
            <div className="" key={item._id.toString()}>
              <PosItemCard item={item} onClick={handleItemClick} />
            </div>
          ))}
        </div>
      </div>

      {/* Side Panel */}
      <div id="pos-side-panel" className="p-4">
        <PosSideMenu
          tableNo={order.tableNo}
          items={order.menuItems}
          total={order.totalPrice}
          onIncrease={handleIncrease}
          onDecrease={handleDecrease}
          onDelete={handleDelete}
        />
      </div>
    </div>


  );
};
