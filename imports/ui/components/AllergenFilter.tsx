import React, { useState, useMemo, useEffect, useRef } from "react";

type AllergenFilterProps = {
  items: { allergens?: string[] }[];
  onAllergenSelect: (allergen: string[]) => void;
  selectedAllergen: string[];
};

export const AllergenFilter = ({
  items,
  onAllergenSelect,
  selectedAllergen,
}: AllergenFilterProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute list of unique allergens found in items
  const allAllergens = useMemo(() => {
    const allergenSet = new Set<string>();

    items.forEach((item) => {
      if (Array.isArray(item.allergens)) {
        item.allergens.forEach((allergen) => {
          if (allergen && typeof allergen === "string") {
            allergenSet.add(allergen);
          }
        });
      }
    });

    return Array.from(allergenSet).sort();
  }, [items]);

  const toggleAllergen = (allergen: string) => {
    const isSelected = selectedAllergen.includes(allergen);
    const updated = isSelected
      ? selectedAllergen.filter((a) => a !== allergen)
      : [...selectedAllergen, allergen];
    onAllergenSelect(updated);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold py-2 px-4 rounded-full"
      >
        Allergens
      </button>

      {showDropdown && (
        <div className="absolute mt-2 w-56 bg-white border rounded-lg shadow-lg z-20 p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-sm">Allergens</span>
            <button
              onClick={() => setShowDropdown(false)}
              className="text-gray-500 text-sm"
            >
              ×
            </button>
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {allAllergens.length > 0 ? (
              allAllergens.map((allergen) => (
                <li key={allergen} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={selectedAllergen.includes(allergen)}
                    onChange={() => toggleAllergen(allergen)}
                    className="mr-2"
                    id={`allergen-${allergen}`}
                  />
                  <label htmlFor={`allergen-${allergen}`} className="text-sm">
                    {allergen}
                  </label>
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-500">No allergens found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
