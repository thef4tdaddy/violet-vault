import logger from "@/utils/core/common/logger";

const LEGACY_STORAGE_KEY = "violet_vault_autofunding_data";
const MIGRATION_COMPLETE_KEY = "violet_vault_autofunding_migrated";

/**
 * Service for managing auto-funding data persistence and migration
 */
export const autoFundingPersistenceService = {
  /**
   * Check if migration has already been completed
   */
  isMigrationComplete: (): boolean => {
    try {
      return localStorage.getItem(MIGRATION_COMPLETE_KEY) === "true";
    } catch (error) {
      logger.error("Failed to check migration status", error);
      return false;
    }
  },

  /**
   * Set migration as complete
   */
  setMigrationComplete: (): void => {
    try {
      localStorage.setItem(MIGRATION_COMPLETE_KEY, "true");
    } catch (error) {
      logger.error("Failed to set migration status", error);
    }
  },

  /**
   * Get legacy data from localStorage if it exists
   */
  getLegacyData: (): Record<string, unknown> | null => {
    try {
      const data = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      logger.error("Failed to read legacy auto-funding data", error);
      return null;
    }
  },

  /**
   * Clear legacy data
   */
  clearLegacyData: (): void => {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (error) {
      logger.error("Failed to clear legacy auto-funding data", error);
    }
  },
};
