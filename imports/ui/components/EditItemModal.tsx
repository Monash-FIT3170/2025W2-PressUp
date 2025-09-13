import React, { useState, useEffect, FormEvent } from "react";
import { Meteor } from "meteor/meteor";
import { Modal } from "./Modal";
import { MenuItem } from "/imports/api/menuItems/MenuItemsCollection";
import { IngredientDropdown } from "./IngredientDropdown";
import { CategoryDropdown } from "./CategoryDropdown";
import { AllergenDropdown } from "./AllergenDropdown";
import { ConfirmModal } from "./ConfirmModal";

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onSave: (updatedItem: Partial<MenuItem>) => void;
}

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

export const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen,
  onClose,
  item,
  onSave,
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
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [available, setAvailable] = useState(false);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [discount, setDiscount] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirm, setConfirm] = useState<"cancel" | "save" | null>(null);
  const [selectedImageType, setSelectedImageType] = useState<
    "predefined" | "upload"
  >("predefined");

  useEffect(() => {
    if (item) {
      setName(item.name);
      setPrice(item.price);
      setAvailable(item.available);
      setIngredients(item.ingredients || []);
      setCategories(item.category || []);
      setAllergens(item.allergens || []);
      setDiscount(item.discount || 0);
      setFormData((prev) => ({ ...prev, image: item.image || "" }));
    }
  }, [item]);

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();

    if (!item || !item.name || !item._id) return;

    Meteor.call(
      "menuItems.update",
      item.name,
      {
        name,
        price,
        ingredients,
        category: categories,
        allergens,
        discount,
        available,
        image: formData.image,
      },
      (error: Meteor.Error | undefined) => {
        if (error) {
          console.error("Error updating item:", error);
        } else {
          onSave({
            _id: item._id,
            name,
            price,
            ingredients,
            category: categories,
            allergens,
            discount,
            available,
            image: formData.image,
          });
          onClose();
        }
      },
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a unique filename
      const timestamp = Date.now();
      const extension = file.name.split(".").pop();
      const newFileName = `custom_${timestamp}.${extension}`;

      setFormData({ ...formData, image: `/menu_items/${newFileName}` });
    }
  };

  const selectPredefinedImage = (imagePath: string) => {
    setFormData({ ...formData, image: imagePath });
  };

  return (
    <>
      <Modal
        open={isOpen} //onClose={onClose}
        onClose={() => {
          setConfirm("cancel");
          setShowConfirmation(true);
        }}
      >
        <div className="p-4 md:p-5 max-h-[80vh] overflow-y-auto w-full">
          <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
            Edit Item
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-press-up-purple border-2 border-press-up-purple text-white text-sm rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 block w-full p-2.5 placeholder-purple-200 
                dark:bg-press-up-purple dark:border-press-up-purple dark:placeholder-purple-200 dark:text-white dark:focus:ring-purple-400 dark:focus:border-purple-400"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
                Price
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setPrice(isNaN(val) ? 0 : val);
                }}
                onBlur={() => setPrice(parseFloat(price.toFixed(2)))}
                className="bg-press-up-purple border-2 border-press-up-purple text-white text-sm rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 block w-full p-2.5 placeholder-purple-200 
                dark:bg-press-up-purple dark:border-press-up-purple dark:placeholder-purple-200 dark:text-white dark:focus:ring-purple-400 dark:focus:border-purple-400"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
                Discount (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={discount}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setDiscount(isNaN(val) ? 0 : Math.min(100, val));
                }}
                className="bg-press-up-purple border-2 border-press-up-purple text-white text-sm rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 block w-full p-2.5 placeholder-purple-200 
                dark:bg-press-up-purple dark:border-press-up-purple dark:placeholder-purple-200 dark:text-white dark:focus:ring-purple-400 dark:focus:border-purple-400"
              />
            </div>

            {discount > 0 && (
              <div className="text-sm text-red-900 dark:text-white">
                <span className="line-through opacity-50 mr-2">
                  ${price.toFixed(2)}
                </span>
                <span className="font-semibold">
                  ${(price * (1 - discount / 100)).toFixed(2)}
                </span>
              </div>
            )}

            <IngredientDropdown
              selectedIngredients={ingredients}
              onChange={setIngredients}
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
              selectedCategories={categories}
              onChange={setCategories}
              initialCategories={["Food", "Drink", "Dessert"]}
            />

            <AllergenDropdown
              selectedAllergen={allergens}
              onChange={setAllergens}
              initialAllergens={["Gluten", "Dairy", "Nuts"]}
            />

            <div>
              <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
                Available
              </label>
              <button
                type="button"
                onClick={() => setAvailable(!available)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-press-up-purple ${
                  available ? "bg-press-up-purple" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    available ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Image Selection */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#a43375" }}
              >
                Image
              </label>

              {/* Image Type Toggle */}
              <div className="flex mb-3 bg-gray-200 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setSelectedImageType("predefined")}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    selectedImageType === "predefined"
                      ? "text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  style={{
                    backgroundColor:
                      selectedImageType === "predefined"
                        ? "#a43375"
                        : "transparent",
                  }}
                >
                  Choose from Gallery
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedImageType("upload")}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    selectedImageType === "upload"
                      ? "text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  style={{
                    backgroundColor:
                      selectedImageType === "upload"
                        ? "#a43375"
                        : "transparent",
                  }}
                >
                  Upload Custom
                </button>
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
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: "" })}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  setConfirm("cancel");
                  setShowConfirmation(true);
                }}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  setConfirm("save");
                  setShowConfirmation(true);
                }}
                className="bg-press-up-purple hover:bg-press-up-purple text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <ConfirmModal
        open={showConfirmation}
        message={confirm === "cancel" ? "Discard changes?" : "Save changes?"}
        onConfirm={() => {
          if (confirm === "cancel") {
            onClose();
          } else if (confirm === "save") {
            handleSubmit();
          }
          setShowConfirmation(false);
          setConfirm(null);
        }}
        onCancel={() => {
          setShowConfirmation(false);
          setConfirm(null);
        }}
      />
    </>
  );
};
