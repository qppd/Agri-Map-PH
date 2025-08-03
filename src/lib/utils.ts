// Recommend supply-demand balancing pairs using nearest-neighbor approach
export function recommendSupplyDemandPairs(classifiedLocations: any[], maxDistanceKm = 50) {
  // Get high supply and high demand locations
  const supplyLocs = classifiedLocations.filter(l => l.supplyLevel === 'super_high_supply' || l.supplyLevel === 'medium_high_supply');
  const demandLocs = classifiedLocations.filter(l => l.demandLevel === 'super_high_demand' || l.demandLevel === 'medium_high_demand');
  const recommendations = [];
  for (const supply of supplyLocs) {
    let bestDemand = null;
    let bestScore = -Infinity;
    for (const demand of demandLocs) {
      if (supply.location.municipality === demand.location.municipality) continue;
      const distance = calculateDistance(supply.location, demand.location);
      if (distance > maxDistanceKm) continue;
      // Score: more supply, more demand, closer distance
      const score = (supply.farmers + demand.buyers) / (distance + 1);
      if (score > bestScore) {
        bestScore = score;
        bestDemand = demand;
      }
    }
    if (bestDemand) {
      recommendations.push({
        from: supply.location,
        to: bestDemand.location,
        supplyCount: supply.farmers,
        demandCount: bestDemand.buyers,
        distance: calculateDistance(supply.location, bestDemand.location),
        score: bestScore,
      });
    }
  }
  return recommendations;
}
import { Location, HeatmapPoint, PriceEntry } from '@/types';

// Geolocation utilities
export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};

// Distance calculation using Haversine formula
export const calculateDistance = (point1: Location, point2: Location): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  const lat1 = toRad(point1.latitude);
  const lat2 = toRad(point2.latitude);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value: number): number => {
  return value * Math.PI / 180;
};

// Generate heatmap points from price entries
export const generateHeatmapPoints = (
  priceEntries: PriceEntry[],
  type: 'supply' | 'demand' | 'price_high' | 'price_low'
): HeatmapPoint[] => {
  const locationGroups = new Map<string, PriceEntry[]>();

  // Group entries by approximate location (rounded to reduce noise)
  priceEntries.forEach(entry => {
    const key = `${entry.location.latitude.toFixed(3)},${entry.location.longitude.toFixed(3)}`;
    if (!locationGroups.has(key)) {
      locationGroups.set(key, []);
    }
    locationGroups.get(key)!.push(entry);
  });

  const heatmapPoints: HeatmapPoint[] = [];

  locationGroups.forEach((entries, key) => {
    const [lat, lng] = key.split(',').map(Number);
    const count = entries.length;
    const averagePrice = entries.reduce((sum, entry) => sum + entry.price, 0) / count;

    let intensity = 0;
    if (type === 'supply') {
      // High supply = many farmer entries
      intensity = Math.min(entries.filter(e => e.userType === 'farmer').length / 10, 1);
    } else if (type === 'demand') {
      // High demand = many buyer entries
      intensity = Math.min(entries.filter(e => e.userType === 'buyer').length / 10, 1);
    } else if (type === 'price_high') {
      // High price relative to average
      const globalAverage = calculateGlobalAverage(priceEntries, entries[0].product.id);
      intensity = Math.min((averagePrice - globalAverage) / globalAverage, 1);
    } else if (type === 'price_low') {
      // Low price relative to average
      const globalAverage = calculateGlobalAverage(priceEntries, entries[0].product.id);
      intensity = Math.min((globalAverage - averagePrice) / globalAverage, 1);
    }

    if (intensity > 0) {
      heatmapPoints.push({
        location: { latitude: lat, longitude: lng },
        intensity: Math.max(0, intensity),
        type,
        count,
        averagePrice,
      });
    }
  });

  return heatmapPoints;
};

const calculateGlobalAverage = (entries: PriceEntry[], productId: string): number => {
  const productEntries = entries.filter(e => e.product.id === productId);
  if (productEntries.length === 0) return 0;
  return productEntries.reduce((sum, entry) => sum + entry.price, 0) / productEntries.length;
};

// Format currency for Philippine Peso
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format timestamp for display
export const formatTimestamp = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return timestamp.toLocaleDateString('en-PH');
};

// Weather API integration (OpenWeatherMap)
// Weather caching: 2 calls per day per region (12h cache)
export const fetchWeatherData = async (location: Location) => {
  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  if (!API_KEY) {
    console.warn('WeatherAPI.com API key not found');
    return null;
  }

  // Gamitin ang region/province as cache key kung available, else lat/lon (mas mataas na precision)
  const regionKey = location.province || `${location.latitude.toFixed(5)},${location.longitude.toFixed(5)}`;
  const cacheKey = `weather_${regionKey}`;
  const cacheRaw = localStorage.getItem(cacheKey);
  if (cacheRaw) {
    try {
      const cache = JSON.parse(cacheRaw);
      // 12 hours = 43,200,000 ms
      if (Date.now() - cache.timestamp < 43200000) {
        return cache.data;
      }
    } catch {}
  }

  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location.latitude},${location.longitude}&aqi=no`
    );
    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }
    const data = await response.json();
    const weather = {
      temperature: data.current.temp_c,
      condition: data.current.condition.text,
      humidity: data.current.humidity,
      description: data.current.condition.text,
    };
    // Cache result
    localStorage.setItem(cacheKey, JSON.stringify({ data: weather, timestamp: Date.now() }));
    return weather;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
};

// Debounce price entry submission: 1hr per user/device/product/location
// Gamitin ito bago mag-submit sa Firebase
export function canSubmitPriceEntry(userType: string, productId: string, location: Location): boolean {
  // Key: userType_productId_lat_lon (mas mataas na precision)
  const key = `last_submit_${userType}_${productId}_${location.latitude.toFixed(5)}_${location.longitude.toFixed(5)}`;
  const last = localStorage.getItem(key);
  if (last && Date.now() - parseInt(last, 10) < 3600000) { // 1 hour = 3,600,000 ms
    return false;
  }
  return true;
}

export function recordPriceEntrySubmission(userType: string, productId: string, location: Location) {
  const key = `last_submit_${userType}_${productId}_${location.latitude.toFixed(5)}_${location.longitude.toFixed(5)}`;
  localStorage.setItem(key, Date.now().toString());
}

// Batch price entries utility (for future use)
// I-save muna sa localStorage, tapos i-upload lahat kada 5 minutes or kapag online na
export function addToBatchPriceEntries(entry: any) {
  const key = 'batch_price_entries';
  const batchRaw = localStorage.getItem(key);
  let batch = batchRaw ? JSON.parse(batchRaw) : [];
  batch.push(entry);
  localStorage.setItem(key, JSON.stringify(batch));
}

export function getBatchPriceEntries(): any[] {
  const key = 'batch_price_entries';
  const batchRaw = localStorage.getItem(key);
  return batchRaw ? JSON.parse(batchRaw) : [];
}

export function clearBatchPriceEntries() {
  localStorage.removeItem('batch_price_entries');
}
// Reverse geocoding to get location name
export const reverseGeocode = async (location: Location): Promise<Partial<Location>> => {
  try {
    // Using Nominatim (free) for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}&zoom=18&addressdetails=1`
    );
    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }
    const data = await response.json();
    const address = data.address || {};

    // Fallback logic: try to get barangay/municipality/province from multiple possible fields
    let barangay = address.suburb || address.village || address.neighbourhood || address.hamlet || address.quarter || address.barrio;
    let municipality = address.city || address.town || address.municipality || address.county || address.locality;
    let province = address.state || address.province || address.region;

    // If barangay is missing but municipality is present and matches Unisan, set barangay to Unisan
    if (!barangay && municipality && municipality.toLowerCase().includes('unisan')) {
      barangay = 'Unisan';
    }

    // If municipality is missing but province is present and matches Quezon, set municipality to Unisan (as fallback for Unisan, Quezon)
    if (!municipality && province && province.toLowerCase().includes('quezon')) {
      municipality = 'Unisan';
    }

    return {
      ...location,
      barangay,
      municipality,
      province,
    };
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return location;
  }
};


// Classify locations by supply/demand level
export function classifyLocationsBySupplyDemand(priceEntries: PriceEntry[], selectedProduct?: string) {
  // Group by rounded lat/lon
  const locationGroups = new Map<string, { location: Location; farmers: number; buyers: number; entries: PriceEntry[] }>();
  priceEntries.forEach(entry => {
    if (selectedProduct && entry.product.id !== selectedProduct) return;
    const key = `${entry.location.latitude.toFixed(3)},${entry.location.longitude.toFixed(3)}`;
    if (!locationGroups.has(key)) {
      locationGroups.set(key, {
        location: entry.location,
        farmers: 0,
        buyers: 0,
        entries: [],
      });
    }
    const group = locationGroups.get(key)!;
    if (entry.userType === 'farmer') group.farmers++;
    if (entry.userType === 'buyer') group.buyers++;
    group.entries.push(entry);
  });

  // Compute thresholds
  const farmerCounts = Array.from(locationGroups.values()).map(g => g.farmers);
  const buyerCounts = Array.from(locationGroups.values()).map(g => g.buyers);
  const farmerMax = Math.max(1, ...farmerCounts);
  const buyerMax = Math.max(1, ...buyerCounts);

  // Classify (lowered thresholds for more visible pins)
  return Array.from(locationGroups.values()).map(g => {
    let supplyLevel: 'super_high_supply' | 'medium_high_supply' | null = null;
    let demandLevel: 'super_high_demand' | 'medium_high_demand' | null = null;
    if (g.farmers >= 0.2 * farmerMax && g.farmers > 0) supplyLevel = 'super_high_supply';
    else if (g.farmers >= 0.1 * farmerMax && g.farmers > 0) supplyLevel = 'medium_high_supply';
    if (g.buyers >= 0.2 * buyerMax && g.buyers > 0) demandLevel = 'super_high_demand';
    else if (g.buyers >= 0.1 * buyerMax && g.buyers > 0) demandLevel = 'medium_high_demand';
    return {
      location: g.location,
      farmers: g.farmers,
      buyers: g.buyers,
      entries: g.entries,
      supplyLevel,
      demandLevel,
    };
  });
}
export const generateBasicRecommendations = (
  userType: 'buyer' | 'farmer' | 'regular',
  userLocation: Location,
  priceEntries: PriceEntry[],
  selectedProduct?: string
) => {
  if (!selectedProduct || priceEntries.length === 0) return [];

  const productEntries = priceEntries.filter(entry => entry.product.id === selectedProduct);
  const recommendations = [];

  if (userType === 'buyer') {
    // Find locations with lowest prices
    const sortedByPrice = productEntries
      .sort((a, b) => a.price - b.price)
      .slice(0, 5);

    for (const entry of sortedByPrice) {
      const distance = calculateDistance(userLocation, entry.location);
      if (distance <= 50) { // Within 50km
        recommendations.push({
          location: entry.location,
          reason: `Low price: ${formatCurrency(entry.price)} per ${entry.product.unit}`,
          confidence: 0.8,
          type: 'buy_here' as const,
          distance,
        });
      }
    }
  } else if (userType === 'farmer') {
    // Find locations with highest prices and high demand
    const sortedByPrice = productEntries
      .sort((a, b) => b.price - a.price)
      .slice(0, 5);

    for (const entry of sortedByPrice) {
      const distance = calculateDistance(userLocation, entry.location);
      if (distance <= 100) { // Within 100km for farmers
        recommendations.push({
          location: entry.location,
          reason: `High price: ${formatCurrency(entry.price)} per ${entry.product.unit}`,
          confidence: 0.7,
          type: 'sell_here' as const,
          distance,
        });
      }
    }
  }

  return recommendations.slice(0, 3); // Return top 3 recommendations
};
