// Firebase database service for AgriMap PH
import { database } from './firebase';
import { ref, push, onValue, off, query, orderByKey, limitToLast, DatabaseReference } from 'firebase/database';
import { PriceEntry } from '@/types';
import { authService } from './authService';

// Database paths
const PRICE_ENTRIES_PATH = 'priceEntries';

export class DataService {
  private static instance: DataService;
  private priceEntriesRef: DatabaseReference;

  private constructor() {
    this.priceEntriesRef = ref(database, PRICE_ENTRIES_PATH);
  }

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Add a new price entry
  public async addPriceEntry(entry: Omit<PriceEntry, 'id' | 'timestamp' | 'userId'>): Promise<string> {
    try {
      // Get current user
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be authenticated to submit price entries');
      }

      // Check if user can submit today
      const canSubmit = await authService.canSubmitPriceEntryToday(currentUser.uid);
      if (!canSubmit) {
        throw new Error('You have already submitted a price entry today. Please try again tomorrow.');
      }

      const entryWithTimestamp: Omit<PriceEntry, 'id'> = {
        ...entry,
        userId: currentUser.uid,
        timestamp: new Date(),
      };

      const newEntryRef = await push(this.priceEntriesRef, entryWithTimestamp);
      const entryId = newEntryRef.key!;

      // Record the daily submission
      await authService.recordDailySubmission(currentUser.uid, entryId);

      return entryId;
    } catch (error) {
      console.error('Error adding price entry:', error);
      throw error;
    }
  }

  // Subscribe to real-time price entries
  public subscribeToPriceEntries(
    callback: (entries: PriceEntry[]) => void,
    limit: number = 1000
  ): () => void {
    const priceEntriesQuery = query(
      this.priceEntriesRef,
      orderByKey(),
      limitToLast(limit)
    );

    const unsubscribe = onValue(priceEntriesQuery, (snapshot) => {
      const entries: PriceEntry[] = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach(key => {
          const entry = data[key];
          let ts = entry.timestamp;
          let parsedDate: Date;
          if (!ts) {
            parsedDate = new Date(0); // fallback to epoch
          } else if (typeof ts === 'string' || typeof ts === 'number') {
            parsedDate = new Date(ts);
          } else if (typeof ts === 'object' && ts.seconds) {
            // Firestore Timestamp object
            parsedDate = new Date(ts.seconds * 1000);
          } else {
            parsedDate = new Date(ts);
          }
          if (isNaN(parsedDate.getTime())) {
            parsedDate = new Date(0);
          }
          entries.push({
            id: key,
            ...entry,
            timestamp: parsedDate,
          });
        });
      }
      // Sort by timestamp (most recent first)
      entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      callback(entries);
    }, (error) => {
      console.error('Error subscribing to price entries:', error);
    });

    // Return unsubscribe function
    return () => off(priceEntriesQuery, 'value', unsubscribe);
  }

  // Get price entries for a specific product
  public subscribeToProductPrices(
    productId: string,
    callback: (entries: PriceEntry[]) => void,
    limit: number = 500
  ): () => void {
    return this.subscribeToPriceEntries((entries) => {
      const filteredEntries = entries.filter(entry => entry.product.id === productId);
      callback(filteredEntries);
    }, limit);
  }

  // Get price entries by location (within radius)
  public subscribeToLocationPrices(
    latitude: number,
    longitude: number,
    radiusKm: number,
    callback: (entries: PriceEntry[]) => void
  ): () => void {
    return this.subscribeToPriceEntries((entries) => {
      const filteredEntries = entries.filter(entry => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          entry.location.latitude,
          entry.location.longitude
        );
        return distance <= radiusKm;
      });
      callback(filteredEntries);
    });
  }

  // Helper function to calculate distance between two points
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  // Analytics functions
  public async getAveragePrice(productId: string, timeRangeHours: number = 24): Promise<number> {
    return new Promise((resolve) => {
      const cutoffTime = new Date(Date.now() - (timeRangeHours * 60 * 60 * 1000));
      
      this.subscribeToProductPrices(productId, (entries) => {
        const recentEntries = entries.filter(entry => entry.timestamp >= cutoffTime);
        
        if (recentEntries.length === 0) {
          resolve(0);
          return;
        }

        const totalPrice = recentEntries.reduce((sum, entry) => sum + entry.price, 0);
        const averagePrice = totalPrice / recentEntries.length;
        resolve(averagePrice);
      });
    });
  }

  // Get market statistics
  public async getMarketStats(productId?: string): Promise<{
    totalEntries: number;
    uniqueProducts: number;
    averagePrice?: number;
    priceRange?: { min: number; max: number };
  }> {
    return new Promise((resolve) => {
      this.subscribeToPriceEntries((entries) => {
        let filteredEntries = entries;
        
        if (productId) {
          filteredEntries = entries.filter(entry => entry.product.id === productId);
        }

        const stats = {
          totalEntries: filteredEntries.length,
          uniqueProducts: [...new Set(entries.map(e => e.product.id))].length,
        };

        if (filteredEntries.length > 0) {
          const prices = filteredEntries.map(e => e.price);
          const totalPrice = prices.reduce((sum, price) => sum + price, 0);
          
          resolve({
            ...stats,
            averagePrice: totalPrice / filteredEntries.length,
            priceRange: {
              min: Math.min(...prices),
              max: Math.max(...prices),
            },
          });
        } else {
          resolve(stats);
        }
      });
    });
  }
}

// Export singleton instance
export const dataService = DataService.getInstance();
