'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { UserType, AgriculturalProduct, TrafficStatus, MarketCondition, Location, PriceEntry, WeatherData } from '@/types';
import { MARKET_CONDITIONS, TRAFFIC_STATUS } from '@/data/products';
import { getCurrentLocation, fetchWeatherData, reverseGeocode, canSubmitPriceEntry, recordPriceEntrySubmission } from '@/lib/utils';
// Dynamically import LocationPicker to avoid SSR issues
const LocationPicker = dynamic(() => import('./LocationPicker'), { ssr: false });
import ProductSelector from './ProductSelector';
import { MapPin, Thermometer, DollarSign, Send, Loader2 } from 'lucide-react';

interface InputFormProps {
  userType: UserType;
  onSubmit: (entry: Omit<PriceEntry, 'id' | 'timestamp'>) => void;
  isSubmitting?: boolean;
}

export default function InputForm({ userType, onSubmit, isSubmitting = false }: InputFormProps) {
  const [selectedProduct, setSelectedProduct] = useState<AgriculturalProduct | null>(null);
  const [price, setPrice] = useState<string>('');
  const [trafficStatus, setTrafficStatus] = useState<TrafficStatus>('moderate');
  const [marketCondition, setMarketCondition] = useState<MarketCondition>('normal');
  const [notes, setNotes] = useState<string>('');
  const [location, setLocation] = useState<Location | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>('');

  // Get location and weather on component mount
  useEffect(() => {
    getLocationAndWeather();
  }, []);

  const getLocationAndWeather = async () => {
    setIsLoadingLocation(true);
    setLocationError('');
    
    try {
      const currentLocation = await getCurrentLocation();
      const locationWithDetails = await reverseGeocode(currentLocation);
      setLocation(locationWithDetails as Location);

      // Fetch weather data
      const weather = await fetchWeatherData(currentLocation);
      if (weather) {
        setWeatherData(weather);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Unable to get your location. Please enable location services.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct || !price || !location) {
      alert('Please fill in all required fields and enable location access.');
      return;
    }

    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      alert('Please enter a valid price.');
      return;
    }

    // Debounce: Bawal mag-submit ng price entry sa parehong product/location sa loob ng 1 hour
    if (!canSubmitPriceEntry(userType, selectedProduct.id, location)) {
      alert('Nakapag-submit ka na ng price entry dito sa product/location na ito sa loob ng 1 hour. Please try again later.');
      return;
    }

    const entry: Omit<PriceEntry, 'id' | 'timestamp'> = {
      userType,
      product: selectedProduct,
      price: priceNumber,
      location,
      trafficStatus,
      marketCondition,
      weather: weatherData ?? null,
      notes: notes.trim() ? notes.trim() : null,
      verified: false,
    };

    onSubmit(entry);
    // I-record ang submission time para sa debounce
    recordPriceEntrySubmission(userType, selectedProduct.id, location);

    // Reset form
    setSelectedProduct(null);
    setPrice('');
    setMarketCondition('normal');
    setNotes('');
  };

  const getUserTypeLabel = () => {
    switch (userType) {
      case 'buyer': return 'Buyer';
      case 'farmer': return 'Farmer';
      case 'regular': return 'Regular User';
      default: return 'User';
    }
  };

  const getPriceLabel = () => {
    switch (userType) {
      case 'buyer': return 'Price you\'re willing to pay';
      case 'farmer': return 'Price you\'re selling for';
      case 'regular': return 'Current market price';
      default: return 'Price';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Share Price Information
        </h2>
        <p className="text-gray-600 mt-1">
          As a {getUserTypeLabel()}, help build our agricultural price database
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Selection */}
        <ProductSelector
          selectedProduct={selectedProduct}
          onProductSelect={setSelectedProduct}
        />

        {/* Price Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getPriceLabel()} (PHP) *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            {selectedProduct && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                per {selectedProduct.unit}
              </span>
            )}
          </div>
        </div>

        {/* Traffic Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Traffic Status
          </label>
          <select
            value={trafficStatus}
            onChange={(e) => setTrafficStatus(e.target.value as TrafficStatus)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {TRAFFIC_STATUS.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Market Condition */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Market Condition
          </label>
          <select
            value={marketCondition}
            onChange={(e) => setMarketCondition(e.target.value as MarketCondition)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {MARKET_CONDITIONS.map(condition => (
              <option key={condition.value} value={condition.value}>
                {condition.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location Display and Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border mb-2">
            <MapPin className="h-5 w-5 text-gray-400" />
            {isLoadingLocation ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-gray-600">Getting your location...</span>
              </div>
            ) : locationError ? (
              <div className="flex-1">
                <span className="text-red-600 text-sm">{locationError}</span>
                <button
                  type="button"
                  onClick={getLocationAndWeather}
                  className="ml-2 text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Retry
                </button>
              </div>
            ) : location ? (
              <div className="text-sm text-gray-700">
                {location.barangay && `${location.barangay}, `}
                {location.municipality && `${location.municipality}, `}
                {location.province || 'Philippines'}
              </div>
            ) : (
              <span className="text-gray-500 text-sm">Location not available</span>
            )}
          </div>
          {/* Map Picker for location selection */}
          {location && !isLoadingLocation && !locationError && (
            <div className="mb-2">
              <LocationPicker
                value={location}
                onChange={async (loc) => {
                  // Optionally reverse geocode again for new marker position
                  const locWithDetails = await reverseGeocode(loc);
                  setLocation(locWithDetails as Location);
                }}
              />
            </div>
          )}
        </div>

        {/* Weather Display */}
        {weatherData && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Weather
            </label>
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Thermometer className="h-5 w-5 text-blue-600" />
              <div className="text-sm">
                <span className="font-medium">{weatherData.temperature}°C</span>
                <span className="text-gray-600 ml-2 capitalize">{weatherData.description}</span>
                <span className="text-gray-500 ml-2">• {weatherData.humidity}% humidity</span>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional information about the product or market..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !selectedProduct || !price || !location}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Submit Price Information</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
