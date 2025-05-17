 import React, { useState } from "react";

export const CategoryFilter = ({ 
  onCategorySelect, 
  initialCategory = 'All'
}) => {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isOpen, setIsOpen] = useState(false);
  const categories = ['All', 'Food', 'Drink'];

  const handleCategoryChange = (category) => {
    const newCategory = category === "None" ? "" : category;
    setSelectedCategory(newCategory);
    onCategorySelect(newCategory);
    setIsOpen(false);
  };

  return (
    <div className="mb-4 px-4">
      <div className="relative inline-block">
        <button
          className="bg-pink-500 text-white font-bold py-2 px-4 rounded-full"
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