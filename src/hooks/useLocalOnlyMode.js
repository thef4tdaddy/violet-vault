import { useState, useCallback } from "react";
import logger from "../utils/logger";

/**
 * DEPRECATED: Legacy local-only mode hook
 * Now replaced by cloudSyncEnabled toggle in budgetStore
 * This is a stub to prevent breaking existing components during migration
 */
export const useLocalOnlyMode = () => {
  const [_loading, _setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Stub values - local-only mode is now handled by cloudSyncEnabled toggle
  const isLocalOnlyMode = false;
  const localOnlyUser = null;
  const isInitialized = true;

  // Stub implementations - all return no-op or default values
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkLocalOnlyMode = useCallback(async () => {
    return { success: false, message: "Local-only mode deprecated" };
  }, []);

  const enterLocalOnlyMode = useCallback(async () => {
    logger.warn("enterLocalOnlyMode called - use cloudSyncEnabled toggle instead");
    return { success: false, error: "Local-only mode deprecated" };
  }, []);

  const exitLocalOnlyModeAndClear = useCallback(async () => {
    logger.warn("exitLocalOnlyModeAndClear called - use cloudSyncEnabled toggle instead");
    return { success: false, error: "Local-only mode deprecated" };
  }, []);

  const updateProfile = useCallback(async () => {
    return { success: false, error: "Local-only mode deprecated" };
  }, []);

  const exportData = useCallback(async () => {
    return { success: false, error: "Local-only mode deprecated" };
  }, []);

  const importData = useCallback(async () => {
    return { success: false, error: "Local-only mode deprecated" };
  }, []);

  const getStats = useCallback(async () => {
    return { success: false, error: "Local-only mode deprecated" };
  }, []);

  const clearAllData = useCallback(async () => {
    return { success: false, error: "Local-only mode deprecated" };
  }, []);

  const isLocalOnlyModeSupported = useCallback(() => {
    return { supported: false, error: "Local-only mode deprecated" };
  }, []);

  const validateImportFile = useCallback(() => {
    return { valid: false, error: "Local-only mode deprecated" };
  }, []);

  return {
    // State
    isLocalOnlyMode,
    localOnlyUser,
    isInitialized,
    loading: _loading,
    error,

    // Actions
    clearError,
    enterLocalOnlyMode,
    exitLocalOnlyModeAndClear,
    updateProfile,
    checkLocalOnlyMode,

    // Data management
    exportData,
    importData,
    getStats,
    clearAllData,

    // Utilities
    isLocalOnlyModeSupported,
    validateImportFile,
  };
};
