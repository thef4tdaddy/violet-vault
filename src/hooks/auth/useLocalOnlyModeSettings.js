import { useState, useRef, useCallback } from "react";
import { globalToast } from "../../stores/ui/toastStore";
import { useLocalOnlyMode } from "../common/useLocalOnlyMode";
import logger from "../../utils/common/logger";

/**
 * Custom hook for Local-Only Mode Settings business logic
 * Extracted from LocalOnlyModeSettings.jsx as part of refactoring
 * 
 * Handles:
 * - Settings modal state management
 * - Data export/import operations
 * - Mode switching and data clearing
 * - Statistics loading and display
 * - Error handling and user feedback
 */
export const useLocalOnlyModeSettings = () => {
  const {
    loading,
    error,
    clearError,
    exitLocalOnlyModeAndClear,
    exportData,
    importData,
    getStats,
    clearAllData,
    validateImportFile,
  } = useLocalOnlyMode();

  const [stats, setStats] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const fileInputRef = useRef(null);

  // Load statistics when requested
  const loadStats = useCallback(async () => {
    try {
      const newStats = await getStats();
      setStats(newStats);
    } catch (err) {
      logger.error("Failed to load stats:", err);
    }
  }, [getStats]);

  // Handle data export
  const handleExportData = useCallback(async () => {
    try {
      await exportData();
    } catch (err) {
      logger.error("Export failed:", err);
    }
  }, [exportData]);

  // Handle data import with validation
  const handleImportData = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileText = await file.text();
      const fileData = JSON.parse(fileText);

      const validation = validateImportFile(fileData);
      if (!validation.valid) {
        globalToast.showError(`Invalid import file: ${validation.error}`, "Invalid File");
        return;
      }

      await importData(fileData);
      await loadStats();
      globalToast.showSuccess("Data imported successfully!", "Import Complete");
    } catch (err) {
      logger.error("Import failed:", err);
      globalToast.showError(`Import failed: ${err.message}`, "Import Failed");
    }
  }, [validateImportFile, importData, loadStats]);

  // Handle mode switch to standard mode
  const handleModeSwitch = useCallback(async (onModeSwitch, onClose, clearData = false) => {
    try {
      await exitLocalOnlyModeAndClear(clearData);
      onModeSwitch("standard");
      onClose();
    } catch (err) {
      logger.error("Failed to exit local-only mode:", err);
    }
  }, [exitLocalOnlyModeAndClear]);

  // Handle clear all data with feedback
  const handleClearAllData = useCallback(async () => {
    try {
      await clearAllData();
      await loadStats();
      globalToast.showSuccess("All data cleared successfully!", "Data Cleared");
    } catch (err) {
      logger.error("Failed to clear data:", err);
    }
  }, [clearAllData, loadStats]);

  // Reset states when modal closes
  const resetStates = useCallback(() => {
    clearError();
    setImportFile(null);
    setStats(null);
  }, [clearError]);

  return {
    loading,
    error,
    stats,
    importFile,
    fileInputRef,
    loadStats,
    handleExportData,
    handleImportData,
    handleModeSwitch,
    handleClearAllData,
    resetStates,
    clearError,
  };
};