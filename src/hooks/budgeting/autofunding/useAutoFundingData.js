import { useState, useEffect, useCallback } from "react";
import logger from "../../../utils/common/logger";

const STORAGE_KEY = "violetVault_autoFunding";

/**
 * Hook for managing auto-funding data persistence and initialization
 * Extracted from useAutoFunding.js for Issue #506
 */
export const useAutoFundingData = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize data from localStorage
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);

      const savedData = localStorage.getItem(STORAGE_KEY);
      let data = null;

      if (savedData) {
        data = JSON.parse(savedData);
        logger.info("Auto-funding data loaded from localStorage", {
          rulesCount: data.rules?.length || 0,
          historyCount: data.executionHistory?.length || 0,
          undoableCount:
            data.undoStack?.filter((item) => item.canUndo).length || 0,
        });
      }

      setIsInitialized(true);
      setLastSaved(data?.lastSaved || null);

      logger.info("Auto-funding data system initialized");

      return data;
    } catch (error) {
      logger.error("Failed to initialize auto-funding data", error);
      setIsInitialized(true); // Still mark as initialized to avoid blocking
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save data to localStorage
  const saveData = useCallback((data) => {
    try {
      const dataToSave = {
        ...data,
        lastSaved: new Date().toISOString(),
        version: "1.1", // Increment version for new extracted utilities format
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      setLastSaved(dataToSave.lastSaved);
      setHasUnsavedChanges(false);

      logger.debug("Auto-funding data saved to localStorage", {
        rulesCount: data.rules?.length || 0,
        historyCount: data.executionHistory?.length || 0,
      });

      return true;
    } catch (error) {
      logger.error("Failed to save auto-funding data to localStorage", error);
      throw error;
    }
  }, []);

  // Load data from localStorage
  const loadData = useCallback(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (!savedData) {
        return null;
      }

      const data = JSON.parse(savedData);
      setLastSaved(data.lastSaved || null);

      logger.info("Auto-funding data loaded", {
        rulesCount: data.rules?.length || 0,
        historyCount: data.executionHistory?.length || 0,
      });

      return data;
    } catch (error) {
      logger.error("Failed to load auto-funding data", error);
      throw error;
    }
  }, []);

  // Export data for backup/sharing
  const exportData = useCallback((data) => {
    try {
      const exportData = {
        ...data,
        exportedAt: new Date().toISOString(),
        version: "1.1",
        source: "violet-vault-autofunding",
      };

      logger.info("Auto-funding data exported", {
        rulesCount: exportData.rules?.length || 0,
        historyCount: exportData.executionHistory?.length || 0,
      });

      return exportData;
    } catch (error) {
      logger.error("Failed to export auto-funding data", error);
      throw error;
    }
  }, []);

  // Import data from backup/sharing
  const importData = useCallback((importData) => {
    try {
      // Validate import data structure
      if (!importData || typeof importData !== "object") {
        throw new Error("Invalid import data format");
      }

      // Handle different versions if needed
      let data = { ...importData };

      if (!data.version || data.version < "1.1") {
        // Migrate older data formats if necessary
        logger.warn("Importing older data format", { version: data.version });
      }

      // Ensure required fields exist
      if (!Array.isArray(data.rules)) {
        data.rules = [];
      }
      if (!Array.isArray(data.executionHistory)) {
        data.executionHistory = [];
      }
      if (!Array.isArray(data.undoStack)) {
        data.undoStack = [];
      }

      // Add import metadata
      data.importedAt = new Date().toISOString();
      data.importedFrom = importData.source || "unknown";

      logger.info("Auto-funding data imported", {
        rulesCount: data.rules.length,
        historyCount: data.executionHistory.length,
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
  const clearData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setLastSaved(null);
      setHasUnsavedChanges(false);

      logger.info("Auto-funding data cleared from localStorage");

      return {
        rules: [],
        executionHistory: [],
        undoStack: [],
        incomePatterns: [],
      };
    } catch (error) {
      logger.error("Failed to clear auto-funding data", error);
      throw error;
    }
  }, []);

  // Reset to default state
  const resetToDefaults = useCallback(() => {
    try {
      const defaultData = {
        rules: [],
        executionHistory: [],
        undoStack: [],
        incomePatterns: [],
        settings: {
          autoSave: true,
          autoBackup: false,
          maxHistoryEntries: 50,
          maxUndoEntries: 10,
        },
        createdAt: new Date().toISOString(),
      };

      setHasUnsavedChanges(true);
      logger.info("Auto-funding data reset to defaults");

      return defaultData;
    } catch (error) {
      logger.error("Failed to reset auto-funding data", error);
      throw error;
    }
  }, []);

  // Check storage availability and space
  const checkStorageHealth = useCallback(() => {
    try {
      const testKey = `${STORAGE_KEY}_test`;
      const testData = JSON.stringify({ test: true });

      localStorage.setItem(testKey, testData);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      if (retrieved !== testData) {
        throw new Error("Storage read/write test failed");
      }

      // Get current data size
      const currentData = localStorage.getItem(STORAGE_KEY);
      const currentSize = currentData ? new Blob([currentData]).size : 0;

      // Estimate available space (rough approximation)
      const storageQuota = 5 * 1024 * 1024; // Assume 5MB localStorage limit
      const usedSpace = Object.keys(localStorage)
        .map((key) => localStorage.getItem(key))
        .reduce((total, item) => total + (item ? new Blob([item]).size : 0), 0);

      return {
        available: true,
        currentSize,
        usedSpace,
        availableSpace: Math.max(0, storageQuota - usedSpace),
        healthScore: Math.min(
          100,
          Math.max(0, 100 - (usedSpace / storageQuota) * 100),
        ),
      };
    } catch (error) {
      logger.error("Storage health check failed", error);
      return {
        available: false,
        error: error.message,
        currentSize: 0,
        usedSpace: 0,
        availableSpace: 0,
        healthScore: 0,
      };
    }
  }, []);

  // Create data backup
  const createBackup = useCallback((data, includeHistory = true) => {
    try {
      const backup = {
        ...data,
        backupCreatedAt: new Date().toISOString(),
        backupVersion: "1.1",
        includesHistory: includeHistory,
      };

      if (!includeHistory) {
        backup.executionHistory = [];
        backup.undoStack = [];
      }

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
    (data, intervalMs = 30000) => {
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
    [hasUnsavedChanges, saveData],
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
