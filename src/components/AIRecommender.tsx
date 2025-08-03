'use client';

import { useEffect, useState, useCallback } from 'react';
import { UserType, Location, PriceEntry, AIRecommendation, RecommendationPair } from '@/types';
import { generateBasicRecommendations, formatCurrency } from '@/lib/utils';
import { Brain, MapPin, TrendingUp, TrendingDown, AlertCircle, Navigation } from 'lucide-react';

interface AIRecommenderProps {
  userType: UserType | null;
  userLocation: Location | null;
  priceEntries: PriceEntry[];
  selectedProduct: string | null;
  recommendations?: RecommendationPair[];
  className?: string;
}

export default function AIRecommender({ 
  userType, 
  userLocation, 
  priceEntries, 
  selectedProduct,
  recommendations = [],
  className = '' 
}: AIRecommenderProps) {
  const [aiRecs, setAiRecs] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateRecommendations = useCallback(async () => {
    if (!userType || !userLocation || !selectedProduct) return;
    setIsLoading(true);
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const recs = generateBasicRecommendations(
        userType,
        userLocation,
        priceEntries,
        selectedProduct
      );
      setAiRecs(recs);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userType, userLocation, selectedProduct, priceEntries]);

  useEffect(() => {
    if (userType && userLocation && selectedProduct && priceEntries.length > 0) {
      generateRecommendations();
    } else {
      setAiRecs([]);
    }
  }, [userType, userLocation, selectedProduct, priceEntries, generateRecommendations]);

  // Fallback message if no entries for selected product
  if (selectedProduct && priceEntries.filter(e => e.product.id === selectedProduct).length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-8 flex items-center justify-center min-h-[200px] ${className}`}>
        <div className="text-center">
          <div className="text-2xl text-gray-400 mb-2">🤖</div>
          <div className="text-lg font-semibold text-gray-700 mb-1">No AI recommendations</div>
          <div className="text-gray-500">Walang sapat na datos para sa napiling produkto.</div>
        </div>
      </div>
    );
  }

  const getRecommendationIcon = (type: AIRecommendation['type']) => {
    switch (type) {
      case 'buy_here':
        return <TrendingDown className="h-5 w-5 text-green-600" />;
      case 'sell_here':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'avoid':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <MapPin className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRecommendationColor = (type: AIRecommendation['type']) => {
    switch (type) {
      case 'buy_here':
        return 'border-green-200 bg-green-50';
      case 'sell_here':
        return 'border-blue-200 bg-blue-50';
      case 'avoid':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getUserTypeMessage = () => {
    if (!userType) return '';
    
    switch (userType) {
      case 'buyer':
        return 'AI suggests these locations for purchasing at better prices:';
      case 'farmer':
        return 'AI suggests these locations for selling at higher prices:';
      case 'regular':
        return 'AI insights for your selected product:';
      default:
        return '';
    }
  };

  const getSelectedProductName = () => {
    if (!selectedProduct) return '';
    const productEntry = priceEntries.find(p => p.product.id === selectedProduct);
    return productEntry?.product.name || '';
  };

  if (!userType || !userLocation) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="h-6 w-6 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800">AI Recommendations</h3>
        </div>
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            Select your user type and enable location access to get AI-powered recommendations.
          </p>
        </div>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">AI Recommendations</h3>
        </div>
        <div className="text-center py-8">
          <Navigation className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            Select a product to get personalized AI recommendations for your area.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="h-6 w-6 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-800">AI Recommendations</h3>
        <div className="flex-1"></div>
        {isLoading && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            <span>Analyzing...</span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">{getUserTypeMessage()}</p>
        {selectedProduct && (
          <p className="text-sm font-medium text-gray-800 mt-1">
            Product: {getSelectedProductName()}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : aiRecs.length > 0 ? (
        <div className="space-y-4">
          {aiRecs.map((rec, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getRecommendationColor(rec.type)}`}
            >
              <div className="flex items-start space-x-3">
                {getRecommendationIcon(rec.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">
                      {rec.type === 'buy_here' && 'Good Buying Location'}
                      {rec.type === 'sell_here' && 'Good Selling Location'}
                      {rec.type === 'avoid' && 'Avoid This Area'}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{(rec.confidence * 100).toFixed(0)}% confident</span>
                      {rec.distance && (
                        <span>• {rec.distance.toFixed(1)}km away</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{rec.reason}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {rec.location.barangay && `${rec.location.barangay}, `}
                      {rec.location.municipality || 'Unknown location'}
                    </span>
                    {rec.estimatedProfit && (
                      <span className="font-medium text-green-600">
                        Est. profit: {formatCurrency(rec.estimatedProfit)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">
            Not enough data available for AI recommendations. 
            <br />
            More price entries are needed for your selected product.
          </p>
        </div>
      )}

      {/* Supply-Demand Balancing Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="mt-8">
          <h4 className="font-semibold text-gray-800 mb-2">Supply-Demand Balancing Suggestions</h4>
          <ul className="space-y-2">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="p-3 rounded border border-blue-100 bg-blue-50 text-xs">
                <span className="font-medium text-blue-700">Move supply</span> from <span className="font-semibold">{rec.from.municipality || 'Unknown'}</span> to <span className="font-semibold">{rec.to.municipality || 'Unknown'}</span>
                <span className="ml-2 text-gray-600">({rec.distance.toFixed(1)} km, supply: {rec.supplyCount}, demand: {rec.demandCount})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Disclaimer */}
      <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-yellow-800">
            <p className="font-medium mb-1">AI Recommendations Disclaimer</p>
            <p>
              These are basic AI suggestions based on available data. Market conditions change rapidly. 
              Always verify current prices and conditions before making decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
