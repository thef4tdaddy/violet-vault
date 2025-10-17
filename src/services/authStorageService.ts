import logger from "../utils/common/logger";

/**
 * Auth Storage Service
 * Handles authentication-related localStorage operations
 * Centralizes storage access to comply with architecture rules
 */
class AuthStorageService {
  private readonly storageKeys = {
    budgetData: "envelopeBudgetData",
    userProfile: "userProfile",
    passwordLastChanged: "passwordLastChanged",
  };

  /**
   * Save encrypted budget data to localStorage
   */
  saveBudgetData(encryptedData: string, salt: Uint8Array, iv: string): void {
    try {
      const dataToStore = {
        encryptedData,
        salt: Array.from(salt),
        iv,
      };
      localStorage.setItem(this.storageKeys.budgetData, JSON.stringify(dataToStore));
      logger.debug("Budget data saved to localStorage");
    } catch (error) {
      logger.error("Failed to save budget data:", error);
      throw error;
    }
  }

  /**
   * Load encrypted budget data from localStorage
   */
  loadBudgetData(): { encryptedData: string; salt: Uint8Array; iv: string } | null {
    try {
      const saved = localStorage.getItem(this.storageKeys.budgetData);
      if (!saved) {
        return null;
      }

      const parsed = JSON.parse(saved);
      return {
        encryptedData: parsed.encryptedData,
        salt: new Uint8Array(parsed.salt),
        iv: parsed.iv,
      };
    } catch (error) {
      logger.error("Failed to load budget data:", error);
      return null;
    }
  }

  /**
   * Check if budget data exists
   */
  hasBudgetData(): boolean {
    return localStorage.getItem(this.storageKeys.budgetData) !== null;
  }

  /**
   * Remove budget data from localStorage
   */
  removeBudgetData(): void {
    try {
      localStorage.removeItem(this.storageKeys.budgetData);
      logger.debug("Budget data removed from localStorage");
    } catch (error) {
      logger.error("Failed to remove budget data:", error);
    }
  }

  /**
   * Save user profile to localStorage
   */
  saveUserProfile(profile: { userName: string; userColor?: string }): void {
    try {
      localStorage.setItem(this.storageKeys.userProfile, JSON.stringify(profile));
      logger.debug("User profile saved to localStorage");
    } catch (error) {
      logger.error("Failed to save user profile:", error);
      throw error;
    }
  }

  /**
   * Load user profile from localStorage
   */
  loadUserProfile(): { userName: string; userColor?: string } | null {
    try {
      const saved = localStorage.getItem(this.storageKeys.userProfile);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      logger.error("Failed to load user profile:", error);
      return null;
    }
  }

  /**
   * Remove user profile from localStorage
   */
  removeUserProfile(): void {
    try {
      localStorage.removeItem(this.storageKeys.userProfile);
      logger.debug("User profile removed from localStorage");
    } catch (error) {
      logger.error("Failed to remove user profile:", error);
    }
  }

  /**
   * Get password last changed timestamp
   */
  getPasswordLastChanged(): number | null {
    try {
      const value = localStorage.getItem(this.storageKeys.passwordLastChanged);
      return value ? parseInt(value, 10) : null;
    } catch (error) {
      logger.error("Failed to get password last changed:", error);
      return null;
    }
  }

  /**
   * Set password last changed timestamp
   */
  setPasswordLastChanged(timestamp: number): void {
    try {
      localStorage.setItem(this.storageKeys.passwordLastChanged, timestamp.toString());
      logger.debug("Password last changed timestamp saved");
    } catch (error) {
      logger.error("Failed to set password last changed:", error);
    }
  }

  /**
   * Clear all auth-related data
   */
  clearAll(): void {
    try {
      this.removeBudgetData();
      this.removeUserProfile();
      localStorage.removeItem(this.storageKeys.passwordLastChanged);
      logger.debug("All auth data cleared from localStorage");
    } catch (error) {
      logger.error("Failed to clear auth data:", error);
    }
  }
}

export const authStorageService = new AuthStorageService();
