'use client';

import { useState, useEffect } from 'react';
import { UserType, PriceEntry, Location, AgriculturalProduct } from '@/types';
import { dataService } from '@/lib/dataService';
import { getCurrentLocation } from '@/lib/utils';
import UserTypeSelector from '@/components/UserTypeSelector';
import InputForm from '@/components/InputForm';
import MapView from '@/components/MapView';
import ProductSelector from '@/components/ProductSelector';
import AIRecommender from '@/components/AIRecommender';
import { PHILIPPINE_AGRICULTURAL_PRODUCTS } from '@/data/products';
import { Map, TrendingUp, Users, Database, Leaf } from 'lucide-react';

export default function Home() {
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
  const [priceEntries, setPriceEntries] = useState<PriceEntry[]>([]);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Get user location on mount
  useEffect(() => {
    getCurrentLocation()
      .then(setUserLocation)
      .catch(console.error);
  }, []);

  // Subscribe to real-time price data
  useEffect(() => {
    const unsubscribe = dataService.subscribeToPriceEntries(setPriceEntries, 500);
    return unsubscribe;
  }, []);

  const handleUserTypeSelect = (userType: UserType) => {
    setSelectedUserType(userType);
    setShowForm(false);
  };

  const handleSubmitPrice = async (entry: Omit<PriceEntry, 'id' | 'timestamp'>) => {
    setIsSubmitting(true);
    try {
      await dataService.addPriceEntry(entry);
      setShowForm(false);
      // Show success message or toast
      alert('Price information submitted successfully!');
    } catch (error) {
      console.error('Error submitting price:', error);
      alert('Failed to submit price information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProductData: AgriculturalProduct | null = selectedProduct 
    ? PHILIPPINE_AGRICULTURAL_PRODUCTS.find(p => p.id === selectedProduct) || null
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Leaf className="h-8 w-8 text-green-600" />
                <h1 className="text-2xl font-bold text-gray-900">AgriMap PH</h1>
              </div>
              <div className="hidden sm:block text-sm text-gray-600">
                Real-time Agricultural Price Mapping
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Database className="h-4 w-4" />
                  <span>{priceEntries.length} entries</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{[...new Set(priceEntries.map(e => e.userType))].length} user types</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedUserType ? (
          /* User Type Selection Screen */
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to AgriMap PH
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join thousands of Filipinos building the most comprehensive real-time 
                agricultural price database. Help your community make better farming and 
                buying decisions.
              </p>
            </div>
            
            <UserTypeSelector 
              selectedUserType={selectedUserType}
              onUserTypeSelect={handleUserTypeSelect}
            />

            {/* Features Section */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <Map className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Real-time Mapping
                </h3>
                <p className="text-gray-600">
                  See live agricultural prices across the Philippines on an interactive map
                </p>
              </div>
              
              <div className="text-center p-6">
                <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  AI Recommendations
                </h3>
                <p className="text-gray-600">
                  Get smart suggestions on where to buy or sell for the best prices
                </p>
              </div>
              
              <div className="text-center p-6">
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Community Driven
                </h3>
                <p className="text-gray-600">
                  Powered by real farmers, buyers, and agriculture enthusiasts nationwide
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Main Application */
          <div className="space-y-8">
            {/* Action Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSelectedUserType(null)}
                    className="text-gray-600 hover:text-gray-800 underline text-sm"
                  >
                    ← Change user type
                  </button>
                  <div className="text-sm">
                    <span className="text-gray-600">You are a:</span>
                    <span className="font-semibold text-gray-800 ml-1 capitalize">
                      {selectedUserType}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="w-full sm:w-64">
                    <ProductSelector
                      products={PHILIPPINE_AGRICULTURAL_PRODUCTS}
                      selectedProduct={selectedProductData}
                      onProductSelect={(product) => setSelectedProduct(product?.id || null)}
                    />
                  </div>
                  
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      showForm
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {showForm ? 'Hide Form' : 'Add Price'}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Left Column - Map */}
              <div className="xl:col-span-2">
                <MapView
                  priceEntries={priceEntries}
                  userLocation={userLocation}
                  selectedUserType={selectedUserType}
                  selectedProduct={selectedProduct}
                />
              </div>

              {/* Right Column - Form and AI */}
              <div className="space-y-8">
                {/* Price Input Form */}
                {showForm && (
                  <InputForm
                    userType={selectedUserType}
                    onSubmit={handleSubmitPrice}
                    isSubmitting={isSubmitting}
                  />
                )}

                {/* AI Recommendations */}
                <AIRecommender
                  userType={selectedUserType}
                  userLocation={userLocation}
                  priceEntries={priceEntries}
                  selectedProduct={selectedProduct}
                />
              </div>
            </div>

            {/* Statistics Footer */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{priceEntries.length}</div>
                  <div className="text-sm text-gray-600">Total Price Entries</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {[...new Set(priceEntries.map(e => e.product.id))].length}
                  </div>
                  <div className="text-sm text-gray-600">Products Tracked</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {[...new Set(priceEntries.map(e => e.location.municipality))].length}
                  </div>
                  <div className="text-sm text-gray-600">Municipalities</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {priceEntries.filter(e => {
                      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
                      return e.timestamp >= hourAgo;
                    }).length}
                  </div>
                  <div className="text-sm text-gray-600">Recent (1h)</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Leaf className="h-6 w-6 text-green-400" />
              <span className="text-xl font-bold">AgriMap PH</span>
            </div>
            <p className="text-gray-400 mb-4">
              Building the future of agriculture through community-driven data
            </p>
            <p className="text-sm text-gray-500">
              © 2025 AgriMap PH. Empowering Filipino agriculture with real-time insights.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
