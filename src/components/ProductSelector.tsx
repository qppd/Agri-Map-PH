'use client';

import { useState } from 'react';
import { AgriculturalProduct } from '@/types';
// import { PHILIPPINE_AGRICULTURAL_PRODUCTS } from '@/data/products';
import { Search, ChevronDown, Package } from 'lucide-react';

interface ProductSelectorProps {
  products: AgriculturalProduct[];
  selectedProduct: AgriculturalProduct | null;
  onProductSelect: (product: AgriculturalProduct | null) => void;
  className?: string;
}

export default function ProductSelector({
  products,
  selectedProduct,
  onProductSelect,
  className = '',
}: ProductSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'rice', label: 'Rice' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'livestock', label: 'Livestock' },
    { value: 'poultry', label: 'Poultry' },
    { value: 'fish', label: 'Fish' },
    { value: 'other', label: 'Other' },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductSelect = (product: AgriculturalProduct) => {
    onProductSelect(product);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Agricultural Product *
      </label>
      
      {/* Selected Product Display / Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex items-center space-x-3">
          <Package className="h-5 w-5 text-gray-400" />
          <span className={selectedProduct ? 'text-gray-900' : 'text-gray-500'}>
            {selectedProduct ? selectedProduct.name : 'Select a product...'}
          </span>
        </div>
        <ChevronDown className={`h-5 w-5 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-[9999] w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredProducts.length > 0 ? (
              <div className="p-2">
                {filteredProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900">{product.name}</span>
                      <span className="text-xs text-gray-500 capitalize">
                        per {product.unit}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 capitalize mt-1">
                      {product.category}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No products found matching your search.
              </div>
            )}
          </div>

          {/* Clear Selection */}
          {selectedProduct && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  onProductSelect(null);
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
