import React, { useState } from 'react';
import { AddMenuItem } from './AddMenuItem';

const Sidebar = () => {
  const [category, setCategory] = useState('Category ▼');
  const [isOpen, setIsOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  const categories = ['Food', 'Drinks', 'All'];

  const handleClose = () => {
    setIsAddItemOpen(false);
  }

  return (
    <div className="w-32 bg-gray-50 p-3 border-r border-gray-200 min-h-screen">
      {/* Add Item Button */}
      <button
        onClick={()=>setIsAddItemOpen(true)}
        className="w-full py-2.5 px-4 rounded-lg mb-4 font-medium text-sm transition-all hover:opacity-90 hover:shadow-md"
        style={{ backgroundColor: '#a43375', color: 'white' }}
      >
        Add Item
      </button>

      {/* Category Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full py-2.5 px-4 rounded-lg flex items-center justify-center font-medium text-sm transition-all hover:opacity-90"
          style={{ backgroundColor: '#a43375', color: 'white' }}
        >
          {category}
        </button>

        {/* Dropdown Options */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-1 rounded-lg shadow-lg overflow-hidden z-10">
            {categories.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  setCategory(option);
                  setIsOpen(false);
                }}
                className={`w-full text-left py-2.5 px-4 transition-all ${category === option ? 'opacity-100' : 'opacity-90'
                  }`}
                style={{
                  backgroundColor: category === option ? '#f7aed9' : 'white',
                  color: '#a43375'
                }}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
      <AddMenuItem
        isOpen={isAddItemOpen}
        onClose={handleClose}
      ></AddMenuItem>
    </div>
  );
};

export default Sidebar;