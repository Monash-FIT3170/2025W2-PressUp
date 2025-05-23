import React, { useState } from "react"; 
import { MenuItemsCollection } from "/imports/api";
import { PosItemCard } from "../../components/PosItemCard";
import { useTracker, useSubscribe } from 'meteor/react-meteor-data';
import { PosSideMenu } from "../../components/PosSideMenu";
import { Meteor } from 'meteor/meteor';

export const MainDisplay = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const isLoadingPosItems = useSubscribe("menuItems")
    const [filterOpen, setFilterOpen] = useState(false);

    const posItems = useTracker( () => MenuItemsCollection.find().fetch());

    const toggleCategory = (category) => {
      if (selectedCategories.includes(category)) {
        setSelectedCategories(selectedCategories.filter((c) => c !== category));
      } else {
        setSelectedCategories([...selectedCategories, category]);
      }
    };
    
    const filteredItems = posItems.filter((item) => {
      const matchesName = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategories.length === 0 ||
        (item.category && item.category.some(cat => selectedCategories.includes(cat)));
      const isAvailable = item.available;
    
      return matchesName && matchesCategory && isAvailable;
    });
    
    

    console.log(filteredItems)

    const handleItemClick = (itemId) => {
      Meteor.call("menuItems.updateQuantity", itemId, 1);
    };

    const categories = ["None","Food", "Drink", "Dessert"];

  return (  
    <div className="grid grid-cols-5 sm:grid-cols-2 md:grid-cols-5 gap-4 p-4 items-start overflow-auto">
      <div id="pos-main-display" className="col-span-4">
        <div id="search-bar" className="mb-4 px-4">
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-pink-400">
            <svg xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="1.5" 
              stroke="currentColor" 
              className="w-5 h-5 text-gray-400 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" 
                  d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
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

        <div className="flex space-x-4 mb-4 px-4">
          {["Food", "Drink", "Dessert"].map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors duration-200 ${
                selectedCategories.includes(cat)
                  ? "bg-pink-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>



        <div id="pos-display" className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 transition-all duration-300 ease-in-out">
            {filteredItems.map((item) => (
              <div className="min-w-[160px] transform transition-all duration-300 hover:scale-105" key={String(item._id)}>
                <PosItemCard item={item} onClick={handleItemClick} />
              </div>
            ))}
          
          </div>
      </div>
      <div id="pos-side-panel" className="col-span-1 ">
        <PosSideMenu items={posItems}></PosSideMenu>
      </div>
    </div>
    
  );
};
