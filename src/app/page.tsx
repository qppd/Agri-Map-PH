'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { UserType, PriceEntry, Location } from '@/types';
import { dataService } from '@/lib/dataService';
import { getCurrentLocation, classifyLocationsBySupplyDemand, recommendSupplyDemandPairs } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import UserTypeSelector from '@/components/UserTypeSelector';
import InputForm from '@/components/InputForm';
import ProductSelector from '@/components/ProductSelector';
import AIRecommender from '@/components/AIRecommender';
import Login from '@/components/Login';
import UserProfile from '@/components/UserProfile';
import { PHILIPPINE_AGRICULTURAL_PRODUCTS } from '@/data/products';
import { Map, TrendingUp, Users, Database, Leaf, LogIn, User } from 'lucide-react';

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <Map className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  )
});

export default function Home() {
  const { user, loading } = useAuth();
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
  const [priceEntries, setPriceEntries] = useState<PriceEntry[]>([]);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Get user location on mount
  useEffect(() => {
    getCurrentLocation()
      .then(setUserLocation)
      .catch(console.error);
  }, []);

  // Subscribe to real-time price data
  useEffect(() => {
    const unsubscribe = dataService.subscribeToPriceEntries((entries) => {
      setPriceEntries(entries);
      // Print loaded data to console
      console.log('Loaded priceEntries from Firebase:', entries);
    }, 500);
    return unsubscribe;
  }, []);

  const handleUserTypeSelect = (userType: UserType) => {
    setSelectedUserType(userType);
    setShowForm(false);
  };

  const handleSubmitPrice = async (entry: Omit<PriceEntry, 'id' | 'timestamp' | 'userId'>) => {
    setIsSubmitting(true);
    try {
      await dataService.addPriceEntry(entry);
      setShowForm(false);
      // Show success message or toast
      alert('Price information submitted successfully!');
    } catch (error) {
      console.error('Error submitting price:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit price information. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProductData = selectedProduct 
    ? PHILIPPINE_AGRICULTURAL_PRODUCTS.find(p => p.id === selectedProduct)
    : null;

  // Filter price entries for current date only
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEntries = priceEntries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate.getTime() === today.getTime();
  });

  // Compute classified locations and recommendations
  const classifiedLocations = classifyLocationsBySupplyDemand(todayEntries, selectedProduct || undefined);
  const recommendations = recommendSupplyDemandPairs(classifiedLocations, 50);

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
              
              {/* Authentication Section */}
              {loading ? (
                <div className="w-8 h-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
              ) : user ? (
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-green-600 transition-colors"
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  <span className="hidden sm:inline">{user.displayName || 'User'}</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
              )}
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
                      selectedProduct={selectedProductData || null}
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
                  priceEntries={todayEntries}
                  userLocation={userLocation}
                  selectedUserType={selectedUserType}
                  selectedProduct={selectedProduct}
                  recommendations={recommendations}
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
                  priceEntries={todayEntries}
                  selectedProduct={selectedProduct}
                  recommendations={recommendations}
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

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Sign In</h2>
              <button
                onClick={() => setShowLogin(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <Login onClose={() => setShowLogin(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Profile</h2>
              <button
                onClick={() => setShowProfile(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <UserProfile />
            </div>
          </div>
        </div>
      )}

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
