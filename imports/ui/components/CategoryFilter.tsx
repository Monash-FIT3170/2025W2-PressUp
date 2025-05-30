 import React, { useState, useEffect } from "react";
 import { Meteor } from "meteor/meteor";
 import { ItemCategory } from "/imports/api/menuItems/ItemCategoriesCollection";

export const CategoryFilter = ({
  onCategorySelect,
  initialCategory = 'All'
}) => {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isOpen, setIsOpen] = useState(false);
  //const categories = ['All', 'Food', 'Drink'];
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    Meteor.call('itemCategories.getAll', (err: Meteor.Error | null, result?: ItemCategory[]) => {
      if (!err && result) {
        // Add 'All' at the beginning for the option to select all
        setCategories(['All', ...result.map((cat) => cat.name)]);
      } else if (err) {
        console.error('Error fetching categories:', err);
      }
    });
  }, []);

  const handleCategoryChange = (category) => {
    const newCategory = category === "All" ? "" : category;
    setSelectedCategory(newCategory);
    onCategorySelect(newCategory);
    setIsOpen(false);
  };

  return (
    <div className="mb-4 px-4">
      <div className="relative inline-block w-20">
        <button
          className="bg-press-up-light-purple text-black font-bold py-2 px-4 rounded-full"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedCategory === "" ? "Filter" : selectedCategory}
        </button>

        {/* Dropdown Options */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-1 rounded-lg shadow-lg overflow-hidden z-10">
            {categories.map((option, index) => (
              <button
                key={index}
                onClick={() => handleCategoryChange(option) }
                className={`w-full text-left py-2.5 px-4 transition-all ${
                  selectedCategory === option ? 'opacity-100' : 'opacity-90'
                }`}
                style={{
                  backgroundColor: selectedCategory === option ? '#f7aed9' : 'white',
                  color: '#a43375'
                }}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};