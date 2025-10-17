import logger from "../utils/common/logger";

/**
 * Budget Storage Service
 * Handles budget-related localStorage operations
 * Centralizes storage access to comply with architecture rules
 */
class BudgetStorageService {
  private readonly storageKeys = {
    autoFunding: "violetVault_autoFunding",
    paydayPrediction: "paydayPredictionData",
    smartSuggestions: "smartSuggestionsState",
    budgetUtilities: "budgetUtilitiesCache",
    lastSyncTime: "lastSyncTime",
  };

  /**
   * Generic localStorage operations for budget features
   */
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      logger.error(`Failed to get item ${key}:`, error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      logger.error(`Failed to set item ${key}:`, error);
      throw error;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      logger.error(`Failed to remove item ${key}:`, error);
    }
  }

  /**
   * Get all localStorage keys
   */
  getAllKeys(): string[] {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      logger.error("Failed to get all keys:", error);
      return [];
    }
  }

  /**
   * Save auto-funding data
   */
  saveAutoFundingData(data: unknown): void {
    try {
      this.setItem(this.storageKeys.autoFunding, JSON.stringify(data));
      logger.debug("Auto-funding data saved");
    } catch (error) {
      logger.error("Failed to save auto-funding data:", error);
      throw error;
    }
  }

  /**
   * Load auto-funding data
   */
  loadAutoFundingData(): unknown | null {
    try {
      const saved = this.getItem(this.storageKeys.autoFunding);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      logger.error("Failed to load auto-funding data:", error);
      return null;
    }
  }

  /**
   * Remove auto-funding data
   */
  removeAutoFundingData(): void {
    this.removeItem(this.storageKeys.autoFunding);
    logger.debug("Auto-funding data removed");
  }

  /**
   * Save payday prediction data
   */
  savePaydayPredictionData(data: unknown): void {
    try {
      this.setItem(this.storageKeys.paydayPrediction, JSON.stringify(data));
      logger.debug("Payday prediction data saved");
    } catch (error) {
      logger.error("Failed to save payday prediction data:", error);
    }
  }

  /**
   * Load payday prediction data
   */
  loadPaydayPredictionData(): unknown | null {
    try {
      const saved = this.getItem(this.storageKeys.paydayPrediction);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      logger.error("Failed to load payday prediction data:", error);
      return null;
    }
  }

  /**
   * Save smart suggestions state
   */
  saveSmartSuggestionsState(data: unknown): void {
    try {
      this.setItem(this.storageKeys.smartSuggestions, JSON.stringify(data));
      logger.debug("Smart suggestions state saved");
    } catch (error) {
      logger.error("Failed to save smart suggestions state:", error);
    }
  }

  /**
   * Load smart suggestions state
   */
  loadSmartSuggestionsState(): unknown | null {
    try {
      const saved = this.getItem(this.storageKeys.smartSuggestions);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      logger.error("Failed to load smart suggestions state:", error);
      return null;
    }
  }

  /**
   * Save budget utilities cache
   */
  saveBudgetUtilitiesCache(data: unknown): void {
    try {
      this.setItem(this.storageKeys.budgetUtilities, JSON.stringify(data));
      logger.debug("Budget utilities cache saved");
    } catch (error) {
      logger.error("Failed to save budget utilities cache:", error);
    }
  }

  /**
   * Load budget utilities cache
   */
  loadBudgetUtilitiesCache(): unknown | null {
    try {
      const saved = this.getItem(this.storageKeys.budgetUtilities);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      logger.error("Failed to load budget utilities cache:", error);
      return null;
    }
  }

  /**
   * Get last sync time
   */
  getLastSyncTime(): string | null {
    return this.getItem(this.storageKeys.lastSyncTime);
  }

  /**
   * Set last sync time
   */
  setLastSyncTime(timestamp: string): void {
    this.setItem(this.storageKeys.lastSyncTime, timestamp);
  }

  /**
   * Clear all budget-related cache data
   */
  clearAllCache(): void {
    try {
      this.removeAutoFundingData();
      this.removeItem(this.storageKeys.paydayPrediction);
      this.removeItem(this.storageKeys.smartSuggestions);
      this.removeItem(this.storageKeys.budgetUtilities);
      logger.debug("All budget cache cleared");
    } catch (error) {
      logger.error("Failed to clear budget cache:", error);
    }
  }
}

export const budgetStorageService = new BudgetStorageService();
