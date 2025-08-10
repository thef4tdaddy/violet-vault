import { useState, useCallback, useEffect } from "react";
import { useLocalOnlyStore } from "../stores/localOnlyStore";
import logger from "../utils/logger";

/**
 * Hook for managing local-only mode functionality
 * Provides methods to enter, exit, and manage local-only budgeting mode
 */
export const useLocalOnlyMode = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    isLocalOnlyMode,
    localOnlyUser,
    isInitialized,
    initializeLocalOnlyMode,
    exitLocalOnlyMode,
    updateLocalUser,
    checkLocalOnlyMode,
    exportLocalOnlyData,
    importLocalOnlyData,
    getLocalOnlyStats,
    clearAllLocalOnlyData
  } = useLocalOnlyStore();

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize local-only mode on app startup
  useEffect(() => {
    if (!isInitialized) {
      checkLocalOnlyMode();
    }
  }, [isInitialized, checkLocalOnlyMode]);

  /**
   * Enter local-only mode with optional user data
   */
  const enterLocalOnlyMode = useCallback(async (userData = null) => {
    try {
      setLoading(true);
      setError(null);

      const result = await initializeLocalOnlyMode(userData);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      logger.debug("Successfully entered local-only mode", {
        userId: result.user.id,
        userName: result.user.userName
      });

      return result;
    } catch (err) {
      const errorMessage = `Failed to enter local-only mode: ${err.message}`;
      setError(errorMessage);
      logger.error("Local-only mode entry failed", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [initializeLocalOnlyMode]);

  /**
   * Exit local-only mode with option to clear data
   */
  const exitLocalOnlyModeAndClear = useCallback(async (clearData = false) => {
    try {
      setLoading(true);
      setError(null);

      const result = await exitLocalOnlyMode(clearData);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      logger.debug("Successfully exited local-only mode", { clearData });
      return result;
    } catch (err) {
      const errorMessage = `Failed to exit local-only mode: ${err.message}`;
      setError(errorMessage);
      logger.error("Local-only mode exit failed", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [exitLocalOnlyMode]);

  /**
   * Update local user profile
   */
  const updateProfile = useCallback(async (updates) => {
    try {
      setLoading(true);
      setError(null);

      const result = await updateLocalUser(updates);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      logger.debug("Local user profile updated", { updates });
      return result;
    } catch (err) {
      const errorMessage = `Failed to update profile: ${err.message}`;
      setError(errorMessage);
      logger.error("Profile update failed", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [updateLocalUser]);

  /**
   * Export all local-only data as downloadable file
   */
  const exportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await exportLocalOnlyData();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // Create downloadable file
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: "application/json"
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `violet-vault-local-only-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      logger.debug("Local-only data exported successfully", {
        totalEnvelopes: result.data.metadata.totalEnvelopes,
        totalTransactions: result.data.metadata.totalTransactions,
        dataSize: result.data.metadata.dataSize
      });

      return result;
    } catch (err) {
      const errorMessage = `Failed to export data: ${err.message}`;
      setError(errorMessage);
      logger.error("Data export failed", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [exportLocalOnlyData]);

  /**
   * Import local-only data from file
   */
  const importData = useCallback(async (importFileData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await importLocalOnlyData(importFileData);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      logger.debug("Local-only data imported successfully", {
        metadata: result.metadata
      });

      return result;
    } catch (err) {
      const errorMessage = `Failed to import data: ${err.message}`;
      setError(errorMessage);
      logger.error("Data import failed", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [importLocalOnlyData]);

  /**
   * Get storage statistics
   */
  const getStats = useCallback(async () => {
    try {
      const result = await getLocalOnlyStats();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      return result.stats;
    } catch (err) {
      logger.error("Failed to get local-only stats", err);
      throw new Error(`Failed to get stats: ${err.message}`);
    }
  }, [getLocalOnlyStats]);

  /**
   * Clear all data (destructive operation)
   */
  const clearAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await clearAllLocalOnlyData();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      logger.debug("All local-only data cleared");
      return result;
    } catch (err) {
      const errorMessage = `Failed to clear data: ${err.message}`;
      setError(errorMessage);
      logger.error("Data clearing failed", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [clearAllLocalOnlyData]);

  /**
   * Check if local-only mode is available (browser support)
   */
  const isLocalOnlyModeSupported = useCallback(() => {
    try {
      // Check localStorage availability
      const testKey = '__violet_vault_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      
      return {
        supported: true,
        features: {
          localStorage: true,
          fileDownload: 'download' in document.createElement('a'),
          fileUpload: 'File' in window,
          jsonParsing: true
        }
      };
    } catch (err) {
      return {
        supported: false,
        error: err.message,
        features: {
          localStorage: false,
          fileDownload: false,
          fileUpload: false,
          jsonParsing: false
        }
      };
    }
  }, []);

  /**
   * Validate import file format
   */
  const validateImportFile = useCallback((fileData) => {
    try {
      if (!fileData) {
        return { valid: false, error: "No data provided" };
      }

      if (fileData.type !== "violet-vault-local-only-export") {
        return { valid: false, error: "Invalid file type" };
      }

      if (fileData.version !== "1.0") {
        return { valid: false, error: `Unsupported version: ${fileData.version}` };
      }

      const requiredFields = ['user', 'exportedAt'];
      for (const field of requiredFields) {
        if (!fileData[field]) {
          return { valid: false, error: `Missing required field: ${field}` };
        }
      }

      return {
        valid: true,
        metadata: fileData.metadata || {},
        exportedAt: fileData.exportedAt,
        user: fileData.user
      };
    } catch (err) {
      return { valid: false, error: `Validation failed: ${err.message}` };
    }
  }, []);

  return {
    // State
    isLocalOnlyMode,
    localOnlyUser,
    isInitialized,
    loading,
    error,

    // Actions
    clearError,
    enterLocalOnlyMode,
    exitLocalOnlyModeAndClear,
    updateProfile,

    // Data management
    exportData,
    importData,
    getStats,
    clearAllData,

    // Utilities
    isLocalOnlyModeSupported,
    validateImportFile
  };
};