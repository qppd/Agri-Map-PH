import { AgriculturalProduct } from '@/types';

export const PHILIPPINE_AGRICULTURAL_PRODUCTS: AgriculturalProduct[] = [
  // Rice
  { id: 'rice-regular', name: 'Rice (Regular)', category: 'rice', unit: 'kg' },
  { id: 'rice-premium', name: 'Rice (Premium)', category: 'rice', unit: 'kg' },
  { id: 'rice-well-milled', name: 'Rice (Well-milled)', category: 'rice', unit: 'kg' },
  { id: 'rice-special', name: 'Rice (Special)', category: 'rice', unit: 'kg' },

  // Vegetables
  { id: 'tomato', name: 'Tomato', category: 'vegetables', unit: 'kg' },
  { id: 'onion-red', name: 'Onion (Red)', category: 'vegetables', unit: 'kg' },
  { id: 'onion-white', name: 'Onion (White)', category: 'vegetables', unit: 'kg' },
  { id: 'garlic', name: 'Garlic', category: 'vegetables', unit: 'kg' },
  { id: 'ginger', name: 'Ginger', category: 'vegetables', unit: 'kg' },
  { id: 'potato', name: 'Potato', category: 'vegetables', unit: 'kg' },
  { id: 'carrot', name: 'Carrot', category: 'vegetables', unit: 'kg' },
  { id: 'cabbage', name: 'Cabbage', category: 'vegetables', unit: 'kg' },
  { id: 'lettuce', name: 'Lettuce', category: 'vegetables', unit: 'kg' },
  { id: 'eggplant', name: 'Eggplant', category: 'vegetables', unit: 'kg' },
  { id: 'okra', name: 'Okra', category: 'vegetables', unit: 'kg' },
  { id: 'kangkong', name: 'Kangkong (Water Spinach)', category: 'vegetables', unit: 'kg' },
  { id: 'pechay', name: 'Pechay (Bok Choy)', category: 'vegetables', unit: 'kg' },
  { id: 'sitaw', name: 'Sitaw (String Beans)', category: 'vegetables', unit: 'kg' },
  { id: 'ampalaya', name: 'Ampalaya (Bitter Gourd)', category: 'vegetables', unit: 'kg' },
  { id: 'squash', name: 'Squash (Kalabasa)', category: 'vegetables', unit: 'kg' },

  // Fruits
  { id: 'banana-latundan', name: 'Banana (Latundan)', category: 'fruits', unit: 'kg' },
  { id: 'banana-lakatan', name: 'Banana (Lakatan)', category: 'fruits', unit: 'kg' },
  { id: 'banana-saba', name: 'Banana (Saba)', category: 'fruits', unit: 'kg' },
  { id: 'mango', name: 'Mango', category: 'fruits', unit: 'kg' },
  { id: 'pineapple', name: 'Pineapple', category: 'fruits', unit: 'piece' },
  { id: 'coconut', name: 'Coconut', category: 'fruits', unit: 'piece' },
  { id: 'papaya', name: 'Papaya', category: 'fruits', unit: 'kg' },
  { id: 'watermelon', name: 'Watermelon', category: 'fruits', unit: 'kg' },
  { id: 'melon', name: 'Melon', category: 'fruits', unit: 'kg' },
  { id: 'rambutan', name: 'Rambutan', category: 'fruits', unit: 'kg' },
  { id: 'lanzones', name: 'Lanzones', category: 'fruits', unit: 'kg' },
  { id: 'pomelo', name: 'Pomelo', category: 'fruits', unit: 'piece' },
  { id: 'durian', name: 'Durian', category: 'fruits', unit: 'kg' },

  // Livestock
  { id: 'pork-kasim', name: 'Pork (Kasim)', category: 'livestock', unit: 'kg' },
  { id: 'pork-liempo', name: 'Pork (Liempo)', category: 'livestock', unit: 'kg' },
  { id: 'pork-pigue', name: 'Pork (Pigue)', category: 'livestock', unit: 'kg' },
  { id: 'beef', name: 'Beef', category: 'livestock', unit: 'kg' },
  { id: 'carabao-meat', name: 'Carabao Meat', category: 'livestock', unit: 'kg' },
  { id: 'goat-meat', name: 'Goat Meat', category: 'livestock', unit: 'kg' },

  // Poultry
  { id: 'chicken-whole', name: 'Chicken (Whole)', category: 'poultry', unit: 'kg' },
  { id: 'chicken-dressed', name: 'Chicken (Dressed)', category: 'poultry', unit: 'kg' },
  { id: 'chicken-egg', name: 'Chicken Egg', category: 'poultry', unit: 'piece' },
  { id: 'duck', name: 'Duck', category: 'poultry', unit: 'kg' },
  { id: 'duck-egg', name: 'Duck Egg (Itlog na Pato)', category: 'poultry', unit: 'piece' },

  // Fish
  { id: 'bangus', name: 'Bangus (Milkfish)', category: 'fish', unit: 'kg' },
  { id: 'tilapia', name: 'Tilapia', category: 'fish', unit: 'kg' },
  { id: 'galunggong', name: 'Galunggong (Round Scad)', category: 'fish', unit: 'kg' },
  { id: 'sardines', name: 'Sardines', category: 'fish', unit: 'kg' },
  { id: 'tuna', name: 'Tuna', category: 'fish', unit: 'kg' },
  { id: 'lapu-lapu', name: 'Lapu-lapu (Grouper)', category: 'fish', unit: 'kg' },
  { id: 'maya-maya', name: 'Maya-maya (Red Snapper)', category: 'fish', unit: 'kg' },
  { id: 'shrimp', name: 'Shrimp (Hipon)', category: 'fish', unit: 'kg' },
  { id: 'crab', name: 'Crab (Alimango)', category: 'fish', unit: 'kg' },
  { id: 'squid', name: 'Squid (Pusit)', category: 'fish', unit: 'kg' },

  // Other
  { id: 'corn-yellow', name: 'Corn (Yellow)', category: 'other', unit: 'kg' },
  { id: 'corn-white', name: 'Corn (White)', category: 'other', unit: 'kg' },
  { id: 'sugar', name: 'Sugar', category: 'other', unit: 'kg' },
  { id: 'coffee-beans', name: 'Coffee Beans', category: 'other', unit: 'kg' },
  { id: 'coconut-oil', name: 'Coconut Oil', category: 'other', unit: 'liter' },
];

export const MARKET_CONDITIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'panic_buying', label: 'Panic Buying' },
  { value: 'overstocked', label: 'Overstocked' },
  { value: 'high_demand', label: 'High Demand' },
  { value: 'low_supply', label: 'Low Supply' },
] as const;

export const TRAFFIC_STATUS = [
  { value: 'light', label: 'Light Traffic' },
  { value: 'moderate', label: 'Moderate Traffic' },
  { value: 'heavy', label: 'Heavy Traffic' },
] as const;

export const USER_TYPES = [
  { value: 'buyer', label: 'Buyer', description: 'Looking to purchase agricultural products' },
  { value: 'farmer', label: 'Farmer', description: 'Selling agricultural products' },
  { value: 'regular', label: 'Regular User', description: 'Contributing price information' },
] as const;

// Philippine regions for location context
export const PHILIPPINE_REGIONS = [
  'National Capital Region (NCR)',
  'Cordillera Administrative Region (CAR)',
  'Region I (Ilocos Region)',
  'Region II (Cagayan Valley)',
  'Region III (Central Luzon)',
  'Region IV-A (CALABARZON)',
  'Region IV-B (MIMAROPA)',
  'Region V (Bicol Region)',
  'Region VI (Western Visayas)',
  'Region VII (Central Visayas)',
  'Region VIII (Eastern Visayas)',
  'Region IX (Zamboanga Peninsula)',
  'Region X (Northern Mindanao)',
  'Region XI (Davao Region)',
  'Region XII (SOCCSKSARGEN)',
  'Region XIII (Caraga)',
  'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)',
] as const;
