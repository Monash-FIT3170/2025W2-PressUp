import { mainPosItems, MenuItem } from "../../../api/MenuItemsCollection";
import { PosItemCard } from "../../components/PosItemCard";
import { PosSideMenu } from "../../components/PosSideMenu"; 
import { useState, useEffect } from "react";

export const MainDisplay = () => {
    const [posItems, setPosItems] = useState<MenuItem[]>(mainPosItems(9));
    const [filteredItems, setFilteredItems] = useState<MenuItem[]>(posItems);
    const [showImageModal, setShowImageModal] = useState(false);
    const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
    const [filter, setFilter] = useState<"ALL" | "Food" | "Drink">("ALL");
    const [cartItems, setCartItems] = useState<MenuItem[]>([]);

    // Initialize filtered items
    useEffect(() => {
        filterItems(posItems, filter);
    }, []);

    // Handle clicking on menu item to add to cart
    const handleItemClick = (item: MenuItem) => {
        const updatedItems = posItems.map(posItem => {
            if (posItem._id === item._id) {
                return { ...posItem, amount: posItem.amount + 1 };
            }
            return posItem;
        });
        
        setPosItems(updatedItems);
        filterItems(updatedItems, filter);
        updateCartItems(updatedItems);
    };

    // Update cart items
    const updateCartItems = (items: MenuItem[]) => {
        const newCartItems = items.filter(item => item.amount > 0);
        setCartItems(newCartItems);
    };

    // Handle clicking on item image to edit
    const handleImageClick = (e: React.MouseEvent, item: MenuItem) => {
        e.stopPropagation(); // Prevent triggering handleItemClick
        setCurrentItem(item);
        setShowImageModal(true);
    };

    // Handle deleting a menu item
    const handleDeleteItem = (e: React.MouseEvent, itemId: string) => {
        e.stopPropagation(); // Prevent triggering handleItemClick
        const updatedItems = posItems.filter(item => item._id !== itemId);
        setPosItems(updatedItems);
        filterItems(updatedItems, filter);
        updateCartItems(updatedItems);
    };

    // Handle adding a new item
    const handleAddItem = () => {
        const newId = `item-${Date.now()}`;
        const imagePath = "/api/placeholder/100/100";
        const newItem: MenuItem = {
            _id: newId,
            name: "New Item",
            price: 0,
            amount: 0,
            image: imagePath,
            imageUrl: imagePath,
            category: "Food"
        };
        
        const updatedItems = [...posItems, newItem];
        setPosItems(updatedItems);
        filterItems(updatedItems, filter);
    };

    // Filter items based on category
    const filterItems = (items: MenuItem[], filterType: "ALL" | "Food" | "Drink") => {
        if (filterType === "ALL") {
            setFilteredItems(items);
        } else {
            setFilteredItems(items.filter(item => item.category === filterType));
        }
    };

    // Handle filter change
    const handleFilterChange = (newFilter: "ALL" | "Food" | "Drink") => {
        setFilter(newFilter);
        filterItems(posItems, newFilter);
    };

    // Update item image
    const handleUpdateImage = (url: string) => {
        if (currentItem) {
            const updatedItems = posItems.map(item => 
                item._id === currentItem._id ? { ...item, image: url, imageUrl: url } : item
            );
            setPosItems(updatedItems);
            filterItems(updatedItems, filter);
            setShowImageModal(false);
        }
    };

    // Handle updating quantity from side menu
    const handleUpdateQuantity = (itemId: string, change: number) => {
        const updatedItems = posItems.map(item => {
            if (item._id === itemId) {
                const newAmount = Math.max(0, item.amount + change);
                return { ...item, amount: newAmount };
            }
            return item;
        });
        
        setPosItems(updatedItems);
        filterItems(updatedItems, filter);
        updateCartItems(updatedItems);
    };

    return (
        <div className="flex h-screen">
            {/* Main POS Item Grid */}
            <div className="flex-grow overflow-auto p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 items-start">
                    {filteredItems.map((item) => (
                        <div className="min-w-[160px]" key={item._id}>
                            <PosItemCard 
                                item={item} 
                                onClick={() => handleItemClick(item)}
                                onImageClick={(e) => handleImageClick(e, item)}
                                onDeleteClick={(e) => handleDeleteItem(e, item._id)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar with filter controls */}
            <div className="flex flex-col">
                <div className="p-4 bg-white border-l border-b border-gray-300">
                    {/* Add Item Button */}
                    <button 
                        onClick={handleAddItem}
                        className="w-full mb-4 bg-rose-500 text-white py-2 px-4 rounded-full hover:bg-rose-600"
                    >
                        Add Item
                    </button>
                    
                    {/* Filter Buttons */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by:</label>
                        <div className="flex flex-col space-y-2">
                            <button 
                                onClick={() => handleFilterChange("ALL")}
                                className={`py-1 px-3 rounded-full ${filter === "ALL" ? "bg-rose-500 text-white" : "bg-gray-200 text-gray-800"}`}
                            >
                                ALL
                            </button>
                            <button 
                                onClick={() => handleFilterChange("Food")}
                                className={`py-1 px-3 rounded-full ${filter === "Food" ? "bg-rose-500 text-white" : "bg-gray-200 text-gray-800"}`}
                            >
                                Food
                            </button>
                            <button 
                                onClick={() => handleFilterChange("Drink")}
                                className={`py-1 px-3 rounded-full ${filter === "Drink" ? "bg-rose-500 text-white" : "bg-gray-200 text-gray-800"}`}
                            >
                                Drink
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Order Side Menu */}
                <PosSideMenu 
                    items={cartItems} 
                    onUpdateQuantity={handleUpdateQuantity} 
                />
            </div>

            {/* Image Edit Modal */}
            {showImageModal && currentItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Edit Image for {currentItem.name}</h2>
                        <div className="mb-4">
                            <img 
                                src={currentItem.image} 
                                alt={currentItem.name} 
                                className="w-32 h-32 object-cover mx-auto mb-4"
                            />
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Image URL:
                            </label>
                            <input 
                                type="text"
                                className="w-full p-2 border rounded"
                                defaultValue={currentItem.image}
                                id="imageUrlInput"
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button 
                                onClick={() => setShowImageModal(false)}
                                className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    const input = document.getElementById('imageUrlInput') as HTMLInputElement;
                                    handleUpdateImage(input.value);
                                }}
                                className="bg-rose-500 text-white py-2 px-4 rounded hover:bg-rose-600"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};