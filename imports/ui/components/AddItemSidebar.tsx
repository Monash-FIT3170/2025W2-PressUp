import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { MenuItem } from './MenuItemsCollection'; // Adjust import path as needed

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
      // In a real app, you'd upload to a service like Cloudinary or AWS S3
      // For now, we'll just store the file name
      setFormData({ ...formData, image: file.name });
    }
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
              Price
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
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

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#a43375' }}>
              Add Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            {formData.image && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: {formData.image}
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