import logger from "../../utils/common/logger";

/**
 * LocalStorage Service
 * Centralized service for all localStorage operations to maintain clean architecture.
 * Hooks should use this service instead of accessing localStorage directly.
 */
class LocalStorageService {
  // Storage keys used throughout the app
  private readonly KEYS = {
    BUDGET_DATA: "envelopeBudgetData",
    USER_PROFILE: "userProfile",
    AUTO_FUNDING: "violetVault_autoFundingData",
    SMART_SUGGESTIONS_COLLAPSED: "smartSuggestions_collapsed",
    LAST_SYNC_TIME: "lastSyncTime",
    LAST_PAYDAY_NOTIFICATION: "lastPaydayNotification",
  } as const;

  /**
   * Get item from localStorage
   */
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      logger.error(`Failed to get item from localStorage: ${key}`, error);
      return null;
    }
  }

  /**
   * Set item in localStorage
   */
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      logger.error(`Failed to set item in localStorage: ${key}`, error);
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      logger.error(`Failed to remove item from localStorage: ${key}`, error);
    }
  }

  /**
   * Get parsed JSON from localStorage
   */
  getJSON<T>(key: string): T | null {
    try {
      const item = this.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      logger.error(`Failed to parse JSON from localStorage: ${key}`, error);
      return null;
    }
  }

  /**
   * Set JSON in localStorage
   */
  setJSON<T>(key: string, value: T): void {
    try {
      this.setItem(key, JSON.stringify(value));
    } catch (error) {
      logger.error(`Failed to stringify and set JSON in localStorage: ${key}`, error);
    }
  }

  /**
   * Clear all localStorage items
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      logger.error("Failed to clear localStorage", error);
    }
  }

  /**
   * Get all keys matching a prefix
   */
  getKeysByPrefix(prefix: string): string[] {
    try {
      return Object.keys(localStorage).filter((key) => key.startsWith(prefix));
    } catch (error) {
      logger.error(`Failed to get keys by prefix: ${prefix}`, error);
      return [];
    }
  }

  /**
   * Remove all items matching a prefix
   */
  removeByPrefix(prefix: string): void {
    try {
      const keys = this.getKeysByPrefix(prefix);
      keys.forEach((key) => this.removeItem(key));
    } catch (error) {
      logger.error(`Failed to remove items by prefix: ${prefix}`, error);
    }
  }

  // Convenience methods for specific app data

  /**
   * Get budget data
   */
  getBudgetData(): { encryptedData: number[]; salt: number[]; iv: number[] } | null {
    return this.getJSON(this.KEYS.BUDGET_DATA);
  }

  /**
   * Set budget data
   */
  setBudgetData(data: { encryptedData: number[]; salt: number[]; iv: number[] }): void {
    this.setJSON(this.KEYS.BUDGET_DATA, data);
  }

  /**
   * Remove budget data
   */
  removeBudgetData(): void {
    this.removeItem(this.KEYS.BUDGET_DATA);
  }

  /**
   * Get user profile
   */
  getUserProfile(): { 
    userName: string; 
    userColor: string; 
    shareCode?: string;
    joinedVia?: string;
    sharedBy?: string;
  } | null {
    return this.getJSON(this.KEYS.USER_PROFILE);
  }

  /**
   * Set user profile
   */
  setUserProfile(profile: { 
    userName: string; 
    userColor: string;
    shareCode?: string;
    joinedVia?: string;
    sharedBy?: string;
  }): void {
    this.setJSON(this.KEYS.USER_PROFILE, profile);
  }

  /**
   * Get auto-funding data
   */
  getAutoFundingData(): unknown | null {
    return this.getJSON(this.KEYS.AUTO_FUNDING);
  }

  /**
   * Set auto-funding data
   */
  setAutoFundingData(data: unknown): void {
    this.setJSON(this.KEYS.AUTO_FUNDING, data);
  }

  /**
   * Remove auto-funding data
   */
  removeAutoFundingData(): void {
    this.removeItem(this.KEYS.AUTO_FUNDING);
  }

  /**
   * Get smart suggestions collapsed state
   */
  getSmartSuggestionsCollapsed(): boolean {
    const value = this.getItem(this.KEYS.SMART_SUGGESTIONS_COLLAPSED);
    return value ? JSON.parse(value) : false;
  }

  /**
   * Set smart suggestions collapsed state
   */
  setSmartSuggestionsCollapsed(collapsed: boolean): void {
    this.setJSON(this.KEYS.SMART_SUGGESTIONS_COLLAPSED, collapsed);
  }

  /**
   * Get last sync time
   */
  getLastSyncTime(): string | null {
    return this.getItem(this.KEYS.LAST_SYNC_TIME);
  }

  /**
   * Set last sync time
   */
  setLastSyncTime(time: string): void {
    this.setItem(this.KEYS.LAST_SYNC_TIME, time);
  }

  /**
   * Get last payday notification date
   */
  getLastPaydayNotification(): string | null {
    return this.getItem(this.KEYS.LAST_PAYDAY_NOTIFICATION);
  }

  /**
   * Set last payday notification date
   */
  setLastPaydayNotification(date: string): void {
    this.setItem(this.KEYS.LAST_PAYDAY_NOTIFICATION, date);
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();
export default localStorageService;
