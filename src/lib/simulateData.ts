import { DataService } from '@/lib/dataService';
import { PHILIPPINE_AGRICULTURAL_PRODUCTS } from '@/data/products';
import { PriceEntry, UserType, TrafficStatus, MarketCondition, Location } from '@/types';

// Sample cities/municipalities in Region IV-A (CALABARZON)
const CITIES = [
  { municipality: 'Lucena', province: 'Quezon', latitude: 13.9314, longitude: 121.6172 },
  { municipality: 'San Pablo', province: 'Laguna', latitude: 14.0696, longitude: 121.3256 },
  { municipality: 'Batangas City', province: 'Batangas', latitude: 13.7565, longitude: 121.0583 },
  { municipality: 'Trece Martires', province: 'Cavite', latitude: 14.2817, longitude: 120.8647 },
  { municipality: 'Antipolo', province: 'Rizal', latitude: 14.6255, longitude: 121.1245 },
  { municipality: 'Tanauan', province: 'Batangas', latitude: 14.0867, longitude: 121.1496 },
  { municipality: 'Calamba', province: 'Laguna', latitude: 14.1870, longitude: 121.1251 },
  { municipality: 'Lipa', province: 'Batangas', latitude: 13.9411, longitude: 121.1631 },
  { municipality: 'Tayabas', province: 'Quezon', latitude: 14.0247, longitude: 121.5918 },
  { municipality: 'Cainta', province: 'Rizal', latitude: 14.5786, longitude: 121.1227 }
];

const USER_TYPES: UserType[] = ['buyer', 'farmer', 'regular'];
const TRAFFIC: TrafficStatus[] = ['light', 'moderate', 'heavy'];
const MARKET: MarketCondition[] = ['normal', 'panic_buying', 'overstocked', 'high_demand', 'low_supply'];

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPrice(product: { category: string }): number {
  // Simple price ranges by category
  switch (product.category) {
    case 'rice': return +(30 + Math.random() * 20).toFixed(2);
    case 'vegetables': return +(20 + Math.random() * 30).toFixed(2);
    case 'fruits': return +(25 + Math.random() * 40).toFixed(2);
    case 'livestock': return +(180 + Math.random() * 100).toFixed(2);
    case 'poultry': return +(120 + Math.random() * 60).toFixed(2);
    case 'fish': return +(80 + Math.random() * 60).toFixed(2);
    default: return +(50 + Math.random() * 50).toFixed(2);
  }
}

function randomNotes(): string | null {
  const notes = [
    '',
    'Fresh from farm',
    'Wholesale price',
    'Retail price',
    'Limited stocks',
    'High demand',
    'Direct from supplier',
    'Market day',
    'Rainy weather',
    'Good quality',
    'Organicc',
    'Imported',
    'Local harvest',
  ];
  const n = randomFromArray(notes);
  return n || null;
}

export async function simulateAndSaveEntries(count = 2000) {
  const dataService = DataService.getInstance();
  const BARANGAYS = [
    'San Isidro', 'San Roque', 'Poblacion', 'Bagong Silang', 'Mabini', 'Del Pilar', 'San Jose', 'San Juan', 'Santa Cruz', 'Burgos',
    'Maligaya', 'Rizal', 'San Antonio', 'San Pedro', 'San Vicente', 'Santa Maria', 'San Francisco', 'San Miguel', 'San Andres', 'San Nicolas'
  ];
  for (let i = 0; i < count; i++) {
    const city = randomFromArray(CITIES);
    const product = randomFromArray(PHILIPPINE_AGRICULTURAL_PRODUCTS);
    const userType = randomFromArray(USER_TYPES);
    const trafficStatus = randomFromArray(TRAFFIC);
    const marketCondition = randomFromArray(MARKET);
    const price = randomPrice(product);
    const barangay = randomFromArray(BARANGAYS);
    const location: Location = {
      latitude: +(city.latitude + (Math.random() - 0.5) * 0.02),
      longitude: +(city.longitude + (Math.random() - 0.5) * 0.02),
      municipality: city.municipality,
      province: city.province,
      barangay,
    };
    // Simulate weather data
    const weatherConditions = [
      { condition: 'Sunny', description: 'Sunny', humidity: 60 + Math.floor(Math.random() * 20), temperature: +(28 + Math.random() * 8).toFixed(1) },
      { condition: 'Partly Cloudy', description: 'Partly Cloudy', humidity: 70 + Math.floor(Math.random() * 15), temperature: +(26 + Math.random() * 7).toFixed(1) },
      { condition: 'Rainy', description: 'Rain Showers', humidity: 80 + Math.floor(Math.random() * 10), temperature: +(24 + Math.random() * 5).toFixed(1) },
      { condition: 'Thunderstorm', description: 'Thunderstorm', humidity: 85 + Math.floor(Math.random() * 10), temperature: +(23 + Math.random() * 4).toFixed(1) },
      { condition: 'Cloudy', description: 'Cloudy', humidity: 75 + Math.floor(Math.random() * 10), temperature: +(25 + Math.random() * 6).toFixed(1) },
    ];
    const weather = randomFromArray(weatherConditions);
    const entry: any = {
      userType,
      product,
      price,
      location,
      trafficStatus,
      marketCondition,
      notes: randomNotes(),
      verified: false,
      weather,
    };
    await dataService.addPriceEntry(entry);
    await new Promise(res => setTimeout(res, 50)); // avoid DB flood
  }
}

// Run simulation if this file is executed directly (node/tsx)
if (require.main === module) {
  simulateAndSaveEntries(2000).then(() => {
    console.log('Simulation complete.');
    process.exit(0);
  }).catch(e => {
    console.error('Simulation failed:', e);
    process.exit(1);
  });
}
