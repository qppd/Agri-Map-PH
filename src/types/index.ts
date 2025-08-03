// Recommendation pair for supply-demand balancing
export interface RecommendationPair {
  from: Location;
  to: Location;
  supplyCount: number;
  demandCount: number;
  distance: number;
  score: number;
}
// Types for AgriMap PH application

export type UserType = 'buyer' | 'farmer' | 'regular';

export type TrafficStatus = 'light' | 'moderate' | 'heavy';

export type MarketCondition = 'normal' | 'panic_buying' | 'overstocked' | 'high_demand' | 'low_supply';

export interface Location {
  latitude: number;
  longitude: number;
  barangay?: string;
  municipality?: string;
  province?: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  description: string;
}

export interface AgriculturalProduct {
  id: string;
  name: string;
  category: 'rice' | 'vegetables' | 'fruits' | 'livestock' | 'poultry' | 'fish' | 'other';
  unit: string; // kg, sack, piece, etc.
}

export interface PriceEntry {
  id: string;
  userId?: string;
  userType: UserType;
  product: AgriculturalProduct;
  price: number;
  location: Location;
  trafficStatus: TrafficStatus;
  marketCondition: MarketCondition;
  timestamp: Date;
  weather?: WeatherData;
  notes?: string | null;
  verified?: boolean;
}

export interface HeatmapPoint {
  location: Location;
  intensity: number; // 0-1 scale
  type: 'supply' | 'demand' | 'price_high' | 'price_low';
  count: number;
  averagePrice?: number;
}

export interface AIRecommendation {
  location: Location;
  reason: string;
  confidence: number; // 0-1 scale
  type: 'sell_here' | 'buy_here' | 'avoid';
  estimatedProfit?: number;
  distance?: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface FilterOptions {
  userType?: UserType;
  product?: string;
  timeRange?: '1h' | '6h' | '24h' | '7d' | '30d';
  priceRange?: {
    min: number;
    max: number;
  };
  location?: {
    center: Location;
    radius: number; // in kilometers
  };
}
