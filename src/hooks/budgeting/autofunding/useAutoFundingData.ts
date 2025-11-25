import { useState, useEffect, useCallback } from "react";
import logger from "@/utils/common/logger";
import type { AutoFundingData } from "@/hooks/budgeting/autofunding/types";
import {
  checkImportData,
  migrateDataIfNeeded,
  ensureRequiredFields,
  createBackupData,
  testStorageAvailability,
  calculateStorageUsage,
  exportDataHelper,
  clearDataHelper,
  resetToDefaultsHelper,
  initializeFromStorage,
  saveToStorage,
  loadFromStorage,
} from "@/hooks/budgeting/autofunding/useAutoFundingDataHelpers";

/**
 * Hook for managing auto-funding data persistence and initialization
 * Extracted from useAutoFunding.js for Issue #506
 */
export const useAutoFundingData = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize data from localStorage
  const initialize = useCallback(
    () => initializeFromStorage(setIsLoading, setIsInitialized, setLastSaved),
    []
  );

  // Save data to localStorage
  const saveData = useCallback(
    (data: AutoFundingData) => saveToStorage(data, setLastSaved, setHasUnsavedChanges),
    []
  );

  // Load data from localStorage
  const loadData = useCallback(() => loadFromStorage(setLastSaved), []);

  // Export data for backup/sharing
  const exportData = useCallback((data: AutoFundingData): AutoFundingData => {
    try {
      return exportDataHelper(data);
    } catch (error) {
      logger.error("Failed to export auto-funding data", error);
      throw error;
    }
  }, []);

  // Import data from backup/sharing
  const importData = useCallback((importData: AutoFundingData): AutoFundingData => {
    try {
      checkImportData(importData);
      let data: AutoFundingData = { ...importData };
      data = migrateDataIfNeeded(data);
      data = ensureRequiredFields(data);
      data.importedAt = new Date().toISOString();
      data.importedFrom = (importData.source as string) || "unknown";

      logger.info("Auto-funding data imported", {
        rulesCount: data.rules?.length || 0,
        historyCount: data.executionHistory?.length || 0,
        source: data.importedFrom,
      });

      setHasUnsavedChanges(true);
      return data;
    } catch (error) {
      logger.error("Failed to import auto-funding data", error);
      throw error;
    }
  }, []);

  // Clear all data
  const clearData = useCallback((): AutoFundingData => {
    try {
      const result = clearDataHelper();
      setLastSaved(null);
      setHasUnsavedChanges(false);
      return result;
    } catch (error) {
      logger.error("Failed to clear auto-funding data", error);
      throw error;
    }
  }, []);

  // Reset to default state
  const resetToDefaults = useCallback((): AutoFundingData => {
    try {
      const result = resetToDefaultsHelper();
      setHasUnsavedChanges(true);
      return result;
    } catch (error) {
      logger.error("Failed to reset auto-funding data", error);
      throw error;
    }
  }, []);

  // Check storage availability and space
  const checkStorageHealth = useCallback(() => {
    try {
      const available = testStorageAvailability();
      const usage = calculateStorageUsage();
      if (!available) return { available: false, error: "Storage not available", ...usage };
      return { available: true, ...usage };
    } catch (error) {
      logger.error("Storage health check failed", error);
      return {
        available: false,
        error: (error as Error).message,
        currentSize: 0,
        usedSpace: 0,
        availableSpace: 0,
        healthScore: 0,
      };
    }
  }, []);

  // Create data backup
  const createBackup = useCallback((data: AutoFundingData, includeHistory = true) => {
    try {
      const backup = createBackupData(data, includeHistory);
      const backupString = JSON.stringify(backup, null, 2);

      logger.info("Backup created", {
        size: new Blob([backupString]).size,
        includesHistory: includeHistory,
        rulesCount: backup.rules?.length || 0,
      });

      return {
        data: backup,
        string: backupString,
        filename: `violet-vault-autofunding-backup-${new Date().toISOString().split("T")[0]}.json`,
      };
    } catch (error) {
      logger.error("Failed to create backup", error);
      throw error;
    }
  }, []);

  // Auto-initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Mark changes when data is modified
  const markUnsavedChanges = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  // Auto-save functionality
  const enableAutoSave = useCallback(
    (data: AutoFundingData, intervalMs = 30000) => {
      const autoSaveInterval = setInterval(() => {
        if (hasUnsavedChanges && data) {
          try {
            saveData(data);
            logger.debug("Auto-save completed");
          } catch (error) {
            logger.error("Auto-save failed", error);
          }
        }
      }, intervalMs);

      return () => clearInterval(autoSaveInterval);
    },
    [hasUnsavedChanges, saveData]
  );

  return {
    // State
    isInitialized,
    isLoading,
    lastSaved,
    hasUnsavedChanges,

    // Core operations
    initialize,
    saveData,
    loadData,
    clearData,
    resetToDefaults,

    // Import/Export
    exportData,
    importData,

    // Utilities
    checkStorageHealth,
    createBackup,
    markUnsavedChanges,
    enableAutoSave,
  };
};
