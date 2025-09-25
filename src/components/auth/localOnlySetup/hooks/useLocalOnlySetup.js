import { useState, useCallback } from "react";
import { globalToast } from "../../../../stores/ui/toastStore";
import { useLocalOnlyMode } from "../../../../hooks/common/useLocalOnlyMode";
import logger from "../../../../utils/common/logger";
import { DEFAULT_USER_NAME, DEFAULT_USER_COLOR, validateUserName } from "../utils/localOnlySetupUtils";

/**
 * Hook for managing local-only setup state and actions
 * Extracted from LocalOnlySetup.jsx to reduce component complexity
 */
export const useLocalOnlySetup = () => {
  // Local-only mode hook (deprecated but still used)
  const {
    loading,
    error,
    clearError,
    enterLocalOnlyMode,
    importData,
    validateImportFile,
    isLocalOnlyModeSupported,
  } = useLocalOnlyMode();

  // Setup form state
  const [userName, setUserName] = useState(DEFAULT_USER_NAME);
  const [userColor, setUserColor] = useState(DEFAULT_USER_COLOR);
  const [importFile, setImportFile] = useState(null);

  // Handle starting local-only mode with user customization
  const handleStartLocalOnly = useCallback(async (onModeSelected) => {
    const validation = validateUserName(userName);
    if (!validation.isValid) {
      globalToast.showError(validation.error, "Invalid Name");
      return;
    }

    try {
      clearError();
      await enterLocalOnlyMode({
        userName: userName.trim(),
        userColor,
      });
      onModeSelected("local-only");
    } catch (err) {
      logger.error("Failed to start local-only mode:", err);
    }
  }, [userName, userColor, clearError, enterLocalOnlyMode]);

  // Handle importing data and starting local-only mode
  const handleImportAndStart = useCallback(async (onModeSelected) => {
    if (!importFile) {
      globalToast.showError("Please select a file to import", "File Required");
      return;
    }

    try {
      clearError();
      const fileText = await importFile.text();
      const fileData = JSON.parse(fileText);

      const validation = validateImportFile(fileData);
      if (!validation.valid) {
        globalToast.showError(
          `Invalid import file: ${validation.error}`,
          "Invalid File",
        );
        return;
      }

      await importData(fileData);
      await enterLocalOnlyMode(fileData.user);
      onModeSelected("local-only");
    } catch (err) {
      logger.error("Failed to import and start:", err);
      globalToast.showError(`Import failed: ${err.message}`, "Import Failed");
    }
  }, [importFile, clearError, validateImportFile, importData, enterLocalOnlyMode]);

  return {
    // State
    userName,
    setUserName,
    userColor,
    setUserColor,
    importFile,
    setImportFile,
    loading,
    error,

    // Actions
    handleStartLocalOnly,
    handleImportAndStart,
    clearError,

    // Utilities
    isLocalOnlyModeSupported,
  };
};