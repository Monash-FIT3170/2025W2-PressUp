import React, { useState } from 'react';

const Sidebar = () => {
  return (
    <div className="w-32 bg-gray-50 p-3 border-r border-gray-200 min-h-screen">
      {/* Add Item Button */}
      <button 
        className="w-full py-2.5 px-4 rounded-lg mb-4 font-medium text-sm transition-all hover:opacity-100 hover:shadow-md"
        style={{ backgroundColor: "var(--color-press-up-positive-button)", color: "white" }}
      >
        Add Item
      </button>
    </div>
  );
};

export default Sidebar;