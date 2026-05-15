import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, DailyEntry } from './store';

/**
 * Offline-first sync manager
 * Queues changes locally and syncs when network is available
 */

export interface SyncQueueItem {
  id: string;
  type: 'profile' | 'daily_entry' | 'delete';
  timestamp: number;
  data: any;
  synced: boolean;
}

const SYNC_QUEUE_KEY = '@thriveindex_sync_queue';
const LAST_SYNC_KEY = '@thriveindex_last_sync';

export class OfflineSyncManager {
  /**
   * Add an item to the sync queue
   */
  static async queueChange(
    type: 'profile' | 'daily_entry' | 'delete',
    data: any
  ): Promise<void> {
    try {
      const queue = await this.getQueue();
      const item: SyncQueueItem = {
        id: `${type}_${Date.now()}`,
        type,
        timestamp: Date.now(),
        data,
        synced: false,
      };
      queue.push(item);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to queue change:', error);
    }
  }

  /**
   * Get all queued items
   */
  static async getQueue(): Promise<SyncQueueItem[]> {
    try {
      const queue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Failed to get sync queue:', error);
      return [];
    }
  }

  /**
   * Mark items as synced
   */
  static async markSynced(ids: string[]): Promise<void> {
    try {
      const queue = await this.getQueue();
      const updated = queue.map((item) =>
        ids.includes(item.id) ? { ...item, synced: true } : item
      );
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to mark items as synced:', error);
    }
  }

  /**
   * Clear synced items from queue
   */
  static async clearSynced(): Promise<void> {
    try {
      const queue = await this.getQueue();
      const remaining = queue.filter((item) => !item.synced);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remaining));
    } catch (error) {
      console.error('Failed to clear synced items:', error);
    }
  }

  /**
   * Get last sync timestamp
   */
  static async getLastSync(): Promise<number> {
    try {
      const timestamp = await AsyncStorage.getItem(LAST_SYNC_KEY);
      return timestamp ? parseInt(timestamp, 10) : 0;
    } catch (error) {
      console.error('Failed to get last sync time:', error);
      return 0;
    }
  }

  /**
   * Update last sync timestamp
   */
  static async setLastSync(): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    } catch (error) {
      console.error('Failed to set last sync time:', error);
    }
  }

  /**
   * Check if there are pending changes
   */
  static async hasPendingChanges(): Promise<boolean> {
    try {
      const queue = await this.getQueue();
      return queue.some((item) => !item.synced);
    } catch (error) {
      console.error('Failed to check pending changes:', error);
      return false;
    }
  }
}
