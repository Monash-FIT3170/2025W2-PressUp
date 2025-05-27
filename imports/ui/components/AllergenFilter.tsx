import React, { useState, useMemo, useRef, useEffect } from "react";

export const AllergenFilter = ({ 
  onAllergenSelect, 
  initialAllergen = 'None',
  allergens, 
  items 
}) => {
  const [selectedAllergen, setSelectedAllergen] = useState(initialAllergen);
  const [isOpen, setIsOpen] = useState(false);

  // Auto-generate allergens from items if allergens not provided
  const finalAllergens = useMemo(() => {
    if (allergens) {
      return allergens;
    }
    
    if (items && items.length > 0) {
      const allAllergens = items.flatMap(item => item.allergens || []);
      const uniqueAllergens = [...new Set(allAllergens)];
      return ['None', ...uniqueAllergens.sort()];
    }
    
    return ['None']; // Fallback
  }, [allergens, items]);

  const handleAllergenChange = (allergen) => {
    const newAllergen = allergen === "None" ? "" : allergen;
    setSelectedAllergen(newAllergen);
    onAllergenSelect(newAllergen);
    setIsOpen(false);
  };

  return (
    <div className="mb-4 px-4">
      <div className="relative inline-block w-20">
        <button
          className="bg-pink-500 text-white font-bold py-2 px-4 rounded-full"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedAllergen === "" ? "Filter" : selectedAllergen}
        </button>

        {/* Dropdown Options */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-1 rounded-lg shadow-lg overflow-hidden z-10">
            {finalAllergens.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAllergenChange(option)}
                className={`w-full text-left py-2.5 px-4 transition-all ${
                  selectedAllergen === option ? 'opacity-100' : 'opacity-90'
                }`}
                style={{ 
                  backgroundColor: selectedAllergen === option ? '#f7aed9' : 'white',
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