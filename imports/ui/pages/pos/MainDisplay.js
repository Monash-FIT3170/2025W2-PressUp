import React, { useState } from "react"; 
import { MenuItemsCollection } from "/imports/api";
import { PosItemCard } from "../../components/PosItemCard";
import { useTracker, useSubscribe } from 'meteor/react-meteor-data';
import { PosSideMenu } from "../../components/PosSideMenu";
import { Meteor } from 'meteor/meteor';

export const MainDisplay = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const isLoadingPosItems = useSubscribe("menuItems")
    const [filterOpen, setFilterOpen] = useState(false);

    const posItems = useTracker( () => MenuItemsCollection.find().fetch());
    const filteredItems = posItems.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

    console.log(filteredItems)

    const handleItemClick = (itemId) => {
      Meteor.call("menuItems.updateQuantity", itemId, 1);
    };

    const categories = ["Food", "Drink", "Dessert"];

  return (  
    <div className="grid grid-cols-5 sm:grid-cols-2 md:grid-cols-5 gap-4 p-4 items-start overflow-auto">
      <div id="pos-main-display" className="col-span-4">
        <div id="search-bar" className="mb-4 px-4">
          <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
        </div>

        <div id="category-filter" className="mb-4 px-4">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="bg-pink-400 hover:bg-pink-500 text-white font-bold py-2 px-4 rounded-full">
              Filter
          </button>
          {filterOpen && (
            <div className="absolute mt-2 border rounded-lg bg-white shadow-md min-w-[120px] z-10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`block w-full text-left px-4 py-2 hover:bg-pink-100 ${
                    selectedCategory === cat ? "font-bold text-pink-700" : ""
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}          
        </div>

        <div id="pos-display" className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {filteredItems.map((item) => (
              <div className="min-w-[160px]" key={String(item._id)}>
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
