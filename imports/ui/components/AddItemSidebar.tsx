import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { MenuItem } from './MenuItemsCollection'; // Adjust import path as needed


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

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    ingredients: [] as string[],
    available: true,
    price: 0,
    category: [] as string[],
    image: ''
  });
  const [newIngredient, setNewIngredient] = useState('');
  const [selectedImageType, setSelectedImageType] = useState<'predefined' | 'upload'>('predefined');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableCategories = ['Food', 'Drinks', 'Desserts', 'Appetizers', 'Main Course'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const menuItem: Omit<MenuItem, '_id'> = {
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await new Promise<void>((resolve, reject) => {
        Meteor.call('menuItems.insert', menuItem, (error: any) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      console.log('Menu item created successfully');
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error creating menu item:', error);
      alert('Error creating menu item: ' + (error.reason || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      quantity: 0,
      ingredients: [],
      available: true,
      price: 0,
      category: [],
      image: ''
    });
    setNewIngredient('');
    setSelectedImageType('predefined');
  };

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, newIngredient.trim()]
      });
      setNewIngredient('');
    }
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    });
  };

  const toggleCategory = (cat: string) => {
    setFormData({
      ...formData,
      category: formData.category.includes(cat)
        ? formData.category.filter(c => c !== cat)
        : [...formData.category, cat]
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
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
      <div className="bg-gray-100 rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto mt-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#a43375' }}>
          Add New Menu Item
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#a43375' }}>
              Name
            </label>
            <input
              type="text"
              placeholder="Item Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
              required
            />
          </div>

          {/* Price */}
          <div>
  <label className="block text-sm font-medium mb-1" style={{ color: '#a43375' }}>
    Price ($)
  </label>
  <input
    type="number"
    step="any"
    min="0"
    placeholder="10.65"
    value={formData.price || ''}
    onChange={(e) => {
      const value = e.target.value;
      // Allow empty string for better user experience while typing
      if (value === '') {
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
    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
    required
  />
</div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#a43375' }}>
              Quantity
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
              required
            />
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#a43375' }}>
              Ingredients
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add ingredient"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
              />
              <button
                type="button"
                onClick={addIngredient}
                className="px-4 py-2 rounded-lg text-white hover:opacity-90 transition-all"
                style={{ backgroundColor: '#a43375' }}
              >
                Add
              </button>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-pink-100 rounded">
                  <span className="text-sm">{ingredient}</span>
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#a43375' }}>
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`p-2 rounded-lg text-sm transition-all ${
                    formData.category.includes(cat)
                      ? 'text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{
                    backgroundColor: formData.category.includes(cat) ? '#a43375' : 'transparent'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            {formData.category.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: {formData.category.join(', ')}
              </div>
            )}
          </div>

          {/* Availability */}
          <div className="flex items-center space-x-3">
            <label className="block text-sm font-medium" style={{ color: '#a43375' }}>
              Availability
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#a43375' }}
              />
              <span className="ml-2 text-sm text-gray-700">
                {formData.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>

          {/* Image Selection */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#a43375' }}>
              Image
            </label>
            
            {/* Image Type Toggle */}
            <div className="flex mb-3 bg-gray-200 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setSelectedImageType('predefined')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  selectedImageType === 'predefined'
                    ? 'text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={{
                  backgroundColor: selectedImageType === 'predefined' ? '#a43375' : 'transparent'
                }}
              >
                Choose from Gallery
              </button>
              <button
                type="button"
                onClick={() => setSelectedImageType('upload')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  selectedImageType === 'upload'
                    ? 'text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={{
                  backgroundColor: selectedImageType === 'upload' ? '#a43375' : 'transparent'
                }}
              >
                Upload Custom
              </button>
            </div>

            {/* Predefined Images Grid */}
            {selectedImageType === 'predefined' && (
              <div className="grid grid-cols-3 gap-2 mb-3 max-h-48 overflow-y-auto border rounded-lg p-2">
                {possibleImages.map((imagePath, index) => {
                  const imageName = imagePath.split('/').pop()?.replace('.png', '') || '';
                  return (
                    <div
                      key={index}
                      onClick={() => selectPredefinedImage(imagePath)}
                      className={`cursor-pointer border-2 rounded-lg p-2 text-center transition-all hover:shadow-md ${
                        formData.image === imagePath
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={imagePath}
                        alt={imageName}
                        className="w-full h-12 object-cover rounded mb-1"
                        onError={(e) => {
                          // Fallback if image doesn't exist
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <span className="text-xs text-gray-600 capitalize">
                        {imageName.replace(/[_-]/g, ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Custom Upload */}
            {selectedImageType === 'upload' && (
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
                      e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="%23a43375" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>';
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Selected Image:</p>
                    <p className="text-xs text-gray-500">
                      {formData.image.split('/').pop()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: '' })}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#a43375' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Sidebar: React.FC = () => {
  const [category, setCategory] = useState('Category ▼');
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = ['Food', 'Drinks', 'All'];

  const handleAddItemSuccess = () => {
    // You can add any additional logic here, like refreshing a list
    console.log('Item added successfully!');
  };

  return (
    <>
      <div className="w-32 bg-gray-50 p-3 border-r border-gray-200 min-h-screen">
        {/* Add Item Button */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-2.5 px-4 rounded-lg mb-4 font-medium text-sm transition-all hover:opacity-90 hover:shadow-md"
          style={{ backgroundColor: '#a43375', color: 'white' }}
        >
          Add Item
        </button>

        {/* Category Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
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
                  className={`w-full text-left py-2.5 px-4 transition-all ${
                    category === option ? 'opacity-100' : 'opacity-90'
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