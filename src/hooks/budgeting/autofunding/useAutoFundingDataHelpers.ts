/**
 * Helper functions for useAutoFundingData
 * Extracted to reduce file size and complexity
 */
import logger from "@/utils/common/logger";
import localStorageService from "@/services/storage/localStorageService";

const STORAGE_KEY = "violetVault_autoFunding";

/**
 * Check import data structure
 */
export const checkImportData = (importData: any): void => {
  if (!importData || typeof importData !== "object") {
    throw new Error("Invalid import data format");
  }
};

/**
 * Migrate older data formats if necessary
 */
export const migrateDataIfNeeded = (data: any): any => {
  if (!data.version || data.version < "1.1") {
    logger.warn("Importing older data format", { version: data.version });
  }
  return data;
};

/**
 * Ensure required fields exist in data
 */
export const ensureRequiredFields = (data: any): any => {
  if (!Array.isArray(data.rules)) {
    data.rules = [];
  }
  if (!Array.isArray(data.executionHistory)) {
    data.executionHistory = [];
  }
  if (!Array.isArray(data.undoStack)) {
    data.undoStack = [];
  }
  return data;
};

/**
 * Create backup data structure
 */
export const createBackupData = (data: any, includeHistory: boolean): any => {
  const backup: any = {
    ...data,
    backupCreatedAt: new Date().toISOString(),
    backupVersion: "1.1",
    includesHistory: includeHistory,
  };

  if (!includeHistory) {
    backup.executionHistory = [];
    backup.undoStack = [];
  }

  return backup;
};

/**
 * Test storage availability
 */
export const testStorageAvailability = (): boolean => {
  try {
    const testKey = `${STORAGE_KEY}_test`;
    const testData = JSON.stringify({ test: true });

    localStorageService.setItem(testKey, testData);
    const retrieved = localStorageService.getItem(testKey);
    localStorageService.removeItem(testKey);

    if (retrieved !== testData) {
      throw new Error("Storage read/write test failed");
    }

    return true;
  } catch (error) {
    logger.error("Storage availability test failed", error);
    return false;
  }
};

/**
 * Calculate storage usage
 */
export const calculateStorageUsage = (): any => {
  try {
    const currentData = localStorageService.getItem(STORAGE_KEY);
    const currentSize = currentData ? new Blob([currentData]).size : 0;

    const storageQuota = 5 * 1024 * 1024; // 5MB localStorage limit
    const allKeys = localStorageService.getKeysByPrefix("");
    const usedSpace = allKeys
      .map((key) => localStorageService.getItem(key))
      .reduce((total, item) => total + (item ? new Blob([item]).size : 0), 0);

    return {
      currentSize,
      usedSpace,
      availableSpace: Math.max(0, storageQuota - usedSpace),
      healthScore: Math.min(100, Math.max(0, 100 - (usedSpace / storageQuota) * 100)),
    };
  } catch (error) {
    logger.error("Failed to calculate storage usage", error);
    return {
      currentSize: 0,
      usedSpace: 0,
      availableSpace: 0,
      healthScore: 0,
    };
  }
};

/**
 * Export data for backup/sharing
 */
export const exportDataHelper = (data: any): any => {
  const exportData: any = {
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
};

/**
 * Clear all data from localStorage
 */
export const clearDataHelper = (): any => {
  localStorageService.removeItem(STORAGE_KEY);
  logger.info("Auto-funding data cleared from localStorage");

  return {
    rules: [],
    executionHistory: [],
    undoStack: [],
    incomePatterns: [],
  };
};

/**
 * Initialize data from localStorage
 */
export const initializeFromStorage = async (
  setIsLoading: (val: boolean) => void,
  setIsInitialized: (val: boolean) => void,
  setLastSaved: (val: any) => void
): Promise<any | null> => {
  try {
    setIsLoading(true);
    const data = localStorageService.getJSON(STORAGE_KEY) as any | null;

    if (data) {
      logger.info("Auto-funding data loaded from localStorage", {
        rulesCount: data.rules?.length || 0,
        historyCount: data.executionHistory?.length || 0,
        undoableCount: data.undoStack?.filter((item: any) => item.canUndo).length || 0,
      });
    }

    setIsInitialized(true);
    setLastSaved(data?.lastSaved || null);
    logger.info("Auto-funding data system initialized");
    return data;
  } catch (error) {
    logger.error("Failed to initialize auto-funding data", error);
    setIsInitialized(true);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

/**
 * Save data to localStorage
 */
export const saveToStorage = (
  data: any,
  setLastSaved: (val: any) => void,
  setHasUnsavedChanges: (val: boolean) => void
): boolean => {
  try {
    const dataToSave: any = {
      ...data,
      lastSaved: new Date().toISOString(),
      version: "1.1",
    };

    localStorageService.setJSON(STORAGE_KEY, dataToSave);
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
};

/**
 * Load data from localStorage
 */
export const loadFromStorage = (setLastSaved: (val: any) => void): any | null => {
  try {
    const data = localStorageService.getJSON(STORAGE_KEY) as any | null;
    if (!data) {
      return null;
    }

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
};

/**
 * Reset to default state
 */
export const resetToDefaultsHelper = (): any => {
  const defaultData: any = {
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

  logger.info("Auto-funding data reset to defaults");
  return defaultData;
};
