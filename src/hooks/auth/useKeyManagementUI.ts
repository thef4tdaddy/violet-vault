import { useState, useRef, useCallback } from "react";
import { globalToast } from "../../stores/ui/toastStore";
import logger from "../../utils/common/logger";

/**
 * Hook for managing Key Management Settings UI state
 * Extracts UI state management from KeyManagementSettings component
 */
export const useKeyManagementUI = () => {
  const [activeTab, setActiveTab] = useState("export"); // export, import
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [exportPassword, setExportPassword] = useState("");
  const [importPassword, setImportPassword] = useState("");
  const [vaultPassword, setVaultPassword] = useState("");
  const [showExportPassword, setShowExportPassword] = useState(false);
  const [showImportPassword, setShowImportPassword] = useState(false);
  const [showVaultPassword, setShowVaultPassword] = useState(false);
  const [keyFingerprint, setKeyFingerprint] = useState("");
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const fileInputRef = useRef(null);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const toggleAdvanced = useCallback(() => {
    setShowAdvanced((prev) => !prev);
  }, []);

  const togglePasswordVisibility = useCallback((field) => {
    switch (field) {
      case "export":
        setShowExportPassword((prev) => !prev);
        break;
      case "import":
        setShowImportPassword((prev) => !prev);
        break;
      case "vault":
        setShowVaultPassword((prev) => !prev);
        break;
      default:
        break;
    }
  }, []);

  const updatePassword = useCallback((field, value) => {
    switch (field) {
      case "export":
        setExportPassword(value);
        break;
      case "import":
        setImportPassword(value);
        break;
      case "vault":
        setVaultPassword(value);
        break;
      default:
        break;
    }
  }, []);

  const resetState = useCallback(() => {
    setExportPassword("");
    setImportPassword("");
    setVaultPassword("");
    setImportResult(null);
    setCopiedToClipboard(false);
    setKeyFingerprint("");
  }, []);

  const handleClipboardSuccess = useCallback(() => {
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 3000);
  }, []);

  return {
    // State
    activeTab,
    showAdvanced,
    exportPassword,
    importPassword,
    vaultPassword,
    showExportPassword,
    showImportPassword,
    showVaultPassword,
    keyFingerprint,
    copiedToClipboard,
    importResult,
    fileInputRef,

    // Actions
    handleTabChange,
    toggleAdvanced,
    togglePasswordVisibility,
    updatePassword,
    resetState,
    handleClipboardSuccess,
    setKeyFingerprint,
    setImportResult,
  };
};

/**
 * Hook for key management operations and validation
 * Extracts key operation logic from KeyManagementSettings component
 */
export const useKeyManagementOperations = () => {
  const validateExportPassword = useCallback((password) => {
    if (!password || password.length < 8) {
      globalToast.showError(
        "Export password must be at least 8 characters long",
        "Password Too Short"
      );
      return false;
    }
    return true;
  }, []);

  const validateImportRequirements = useCallback(
    (keyFileData, importPassword, vaultPassword, validation) => {
      if (!validation.valid) {
        globalToast.showError(`Invalid key file: ${validation.error}`, "Invalid Key File", 8000);
        return false;
      }

      if (validation.type === "protected" && !importPassword) {
        globalToast.showError(
          "This key file is password protected. Please enter the export password.",
          "Password Required"
        );
        return false;
      }

      if (!vaultPassword) {
        globalToast.showError(
          "Please enter your vault password to complete the import.",
          "Vault Password Required"
        );
        return false;
      }

      return true;
    },
    []
  );

  const handleFileRead = useCallback(async (file) => {
    try {
      const fileText = await file.text();
      return JSON.parse(fileText);
    } catch (err) {
      logger.error("Failed to read key file:", err);
      globalToast.showError(
        "Failed to read key file. Please check the file format.",
        "File Read Error"
      );
      throw err;
    }
  }, []);

  const handleImportError = useCallback((err) => {
    logger.error("Import failed:", err);
    globalToast.showError(
      "Import failed: " + (err.message || "Unknown error"),
      "Import Failed",
      8000
    );
  }, []);

  const handleOperationError = useCallback((operation, err) => {
    logger.error(`${operation} failed:`, err);
    globalToast.showError(
      `${operation} failed: ${err.message || "Unknown error"}`,
      `${operation} Failed`
    );
  }, []);

  return {
    validateExportPassword,
    validateImportRequirements,
    handleFileRead,
    handleImportError,
    handleOperationError,
  };
};
