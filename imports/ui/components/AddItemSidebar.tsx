import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { IngredientDropdown } from "./IngredientDropdown";
import { CategoryDropdown } from "./CategoryDropdown";
import { Button } from "./interaction/Button";

// Import possible images from mockData
const possibleImages = [
  "/menu_items/cappuccino.png",
  "/menu_items/cookie.png",
  "/menu_items/croissant.png",
  "/menu_items/flat white.png",
  "/menu_items/iced latte.png",
  "/menu_items/latte.png",
  "/menu_items/macchiato.png",
  "/menu_items/mocha.png",
  "/menu_items/muffin.png",
];

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    quantity: 0,
    ingredients: [] as string[],
    available: true,
    price: 0,
    category: [] as string[],
    image: "",
  });
  const [selectedImageType, setSelectedImageType] = useState<
    "predefined" | "upload"
  >("predefined");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise<void>((resolve, reject) => {
        Meteor.call("menuItems.insert", formData, (error: Meteor.Error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      console.log("Menu item created successfully");
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error creating menu item:", error);
      alert(
        "Error creating menu item: " +
          ((error as Meteor.Error).reason || (error as Error).message),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      quantity: 0,
      ingredients: [],
      available: true,
      price: 0,
      category: [],
      image: "",
    });
    setSelectedImageType("predefined");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a unique filename
      const timestamp = Date.now();
      const extension = file.name.split(".").pop();
      const newFileName = `custom_${timestamp}.${extension}`;

      // In a real app, you'd upload to a service like Cloudinary or AWS S3
      // For now, we'll store the custom filename
      setFormData({ ...formData, image: `/menu_items/${newFileName}` });
    }
  };

  const selectPredefinedImage = (imagePath: string) => {
    setFormData({ ...formData, image: imagePath });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      <div className="bg-stone-100 rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto mt-8">
        <h2 className="text-xl font-bold mb-4 text-red-900 dark:text-white">
          Add New Menu Item
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
              Name
            </label>
            <input
              type="text"
              placeholder="Item Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1 text-red-900 dark:text-white">
              Price ($)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="10.65"
              value={formData.price || ""}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty string for better user experience while typing
                if (value === "") {
                  setFormData({ ...formData, price: 0 });
                } else {
                  const numValue = parseFloat(value);
                  if (!isNaN(numValue)) {
                    setFormData({ ...formData, price: numValue });
                  }
                }
              }}
              onBlur={(e) => {
                // Ensure we have a valid number when user leaves the field
                const value = parseFloat(e.target.value);
                if (isNaN(value) || value < 0) {
                  setFormData({ ...formData, price: 0 });
                }
              }}
              className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
              required
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium mb-1 text-red-900 dark:text-white">
              Quantity
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantity: parseInt(e.target.value) || 0,
                })
              }
              className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
              required
            />
          </div>

          {/* Ingredients */}
          <IngredientDropdown
            selectedIngredients={formData.ingredients}
            onChange={(newIngredients: string[]) =>
              setFormData({ ...formData, ingredients: newIngredients })
            }
            initialIngredients={[
              "Milk",
              "Flour",
              "Eggs",
              "Bread",
              "Butter",
              "Strawberries",
              "Avocado",
              "Bacon",
              "Olive Oil",
              "Paprika",
              "Jam",
            ]}
          />

          <CategoryDropdown
            selectedCategories={formData.category}
            onChange={(newCategories: string[]) =>
              setFormData({ ...formData, category: newCategories })
            }
            initialCategories={["Food", "Drink", "Dessert"]}
          />

          {/* Availability */}
          <div className="flex items-center space-x-3">
            <label className="block text-sm font-medium text-red-900 dark:text-white">
              Availability
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) =>
                  setFormData({ ...formData, available: e.target.checked })
                }
                className="w-4 h-4 rounded"
                style={{ accentColor: "#6f597b" }}
              />
              <span className="ml-2 text-sm text-gray-700">
                {formData.available ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>

          {/* Image Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-red-900 dark:text-white">
              Image
            </label>

            {/* Image Type Toggle */}
            <div className="flex mb-3 bg-gray-200 rounded-lg p-1">
              <Button
                variant="positive"
                onClick={() => setSelectedImageType("predefined")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  selectedImageType === "predefined"
                    ? "text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                style={{
                  backgroundColor:
                    selectedImageType === "predefined"
                      ? "#6f597b"
                      : "transparent",
                }}
              >
                Choose from Gallery
              </Button>
              <Button
                variant="positive"
                onClick={() => setSelectedImageType("upload")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  selectedImageType === "upload"
                    ? "text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                style={{
                  backgroundColor:
                    selectedImageType === "upload" ? "#6f597b" : "transparent",
                }}
              >
                Upload Custom
              </Button>
            </div>

            {/* Predefined Images Grid */}
            {selectedImageType === "predefined" && (
              <div className="grid grid-cols-3 gap-2 mb-3 max-h-48 overflow-y-auto border rounded-lg p-2">
                {possibleImages.map((imagePath, index) => {
                  const imageName =
                    imagePath.split("/").pop()?.replace(".png", "") || "";
                  return (
                    <div
                      key={index}
                      onClick={() => selectPredefinedImage(imagePath)}
                      className={`cursor-pointer border-2 rounded-lg p-2 text-center transition-all hover:shadow-md ${
                        formData.image === imagePath
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={imagePath}
                        alt={imageName}
                        className="w-full h-12 object-cover rounded mb-1"
                        onError={(e) => {
                          // Fallback if image doesn't exist
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <span className="text-xs text-gray-600 capitalize">
                        {imageName.replace(/[_-]/g, " ")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Custom Upload */}
            {selectedImageType === "upload" && (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload a custom image (JPG, PNG, etc.)
                </p>
              </div>
            )}

            {/* Selected Image Preview */}
            {formData.image && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img
                    src={formData.image}
                    alt="Selected"
                    className="w-12 h-12 object-cover rounded border"
                    onError={(e) => {
                      // Show placeholder if image fails to load
                      e.currentTarget.src =
                        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="%23a43375" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>';
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Selected Image:
                    </p>
                    <p className="text-xs text-gray-500">
                      {formData.image.split("/").pop()}
                    </p>
                  </div>
                  <Button
                    variant="negative"
                    onClick={() => setFormData({ ...formData, image: "" })}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="negative"
              onClick={() => {
                onClose();
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="positive"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Sidebar: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddItemSuccess = () => {
    // You can add any additional logic here, like refreshing a list
    console.log("Item added successfully!");
  };

  return (
    <>
      <div className="w-32 p-3 border-r border-gray-200 min-h-screen">
        {/* Add Item Button */}
        <Button
          variant="positive"
          onClick={() => setIsModalOpen(true)}
        >
          Add Item
        </Button>
      </div>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleAddItemSuccess}
      />
    </>
  );
};

export default Sidebar;
