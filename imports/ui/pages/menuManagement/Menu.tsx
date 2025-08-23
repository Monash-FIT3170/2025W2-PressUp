import { useState, useEffect } from "react";
import { Outlet } from "react-router";
import { usePageTitle } from "../../hooks/PageTitleContext";
import Sidebar from "../../components/AddItemSidebar";
import { MenuItemsCollection } from "/imports/api";
import { MenuManagementCard } from "../../components/MenuManagmentCards";
import { useTracker, useSubscribe } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { MenuItem } from "/imports/api/menuItems/MenuItemsCollection";
import { EditItemModal } from "../../components/EditItemModal";
import { SearchBar } from "../../components/SearchBar";
import { AllergenFilter } from "../../components/AllergenFilter";

export const Menu = () => {
  // Set title
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Menu Management System");
  }, [setPageTitle]);

  // Subscribe to menu items
  useSubscribe("menuItems");
  const posItems = useTracker(() => MenuItemsCollection.find().fetch());

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Search term state
  const [searchTerm, setSearchTerm] = useState("");

  // Category filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Allergen filter state
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);

  const handleItemClick = (item: MenuItem) => {
    Meteor.call("menuItems.updateQuantity", item._id , 1);
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleSave = async () => {
    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  const toggleCategory = (category: string) => {
      if (selectedCategories.includes(category)) {
        setSelectedCategories(selectedCategories.filter((c) => c !== category));
      } else {
        setSelectedCategories([...selectedCategories, category]);
      }
    };

  // Filter items by search and category
  const filteredItems = posItems
    // Filter by search term (item name)
    .filter(item => {
      if (searchTerm === "") return true;

      // Check for ingredients
      const ingredientsMatch =
        Array.isArray(item.ingredients) &&
        item.ingredients.some(ingredient =>
          ingredient.toLowerCase().includes(searchTerm.toLowerCase())
        );

      return item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || ingredientsMatch;
    })
    // Filter by category
    .filter(item =>
      selectedCategories.length === 0 ||
      (item.category && item.category.some(cat => selectedCategories.includes(cat)))
    )
    // Filter by allergen
    .filter(item => {
      if (selectedAllergens.length === 0) return true;

      return (
        Array.isArray(item.allergens) &&
        selectedAllergens.every(allergen => item.allergens?.includes(allergen))
      );
    });


  return (
    <div className="flex flex-1 overflow-auto">
      {/* Main content area */}
      <div className="flex-1 p-4">
        {/* Search & Filter Section */}
        <div className="mb-4 space-y-2">
          {/* Search Bar */}
          <div className="w-full md-6">
            <SearchBar 
              onSearch={setSearchTerm} 
              initialSearchTerm={searchTerm} 
            />
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

          {/* Allergen Filter */}
            <AllergenFilter 
              items={posItems}
              selectedAllergen={selectedAllergens}
              onAllergenSelect={setSelectedAllergens}               
            />
          </div>
        </div>
        
        {/*Item cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {[...filteredItems]
          .sort((a, b) => {
            // Move unavailable items to the end
            if (a.available === b.available) return 0;
            return a.available ? -1 : 1;
          })
          .map((item) => (
            <div
              key={item._id?.toString()}
              className={`min-w-[160px] rounded-lg transition duration-150
                ${selectedItem?._id === item._id ? "ring-2 ring-white bg-white" : ""}
                w-full h-full p-4
                ${!item.available ? "grayscale opacity-60" : ""}
              `}
            >
              <MenuManagementCard item={item} onClick={handleItemClick} />
            </div>
          ))}
        </div>

         <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedItem(null);
        }}
        item={selectedItem}
        onSave={handleSave}
      />

        <Outlet />
      </div>

      {/* Sidebar positioned on the right */}
      <Sidebar/> 
    </div>
  );
};
