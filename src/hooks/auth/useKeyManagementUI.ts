import React, { useState, useRef, useCallback } from "react";
import { globalToast } from "../../stores/ui/toastStore";
import logger from "../../utils/common/logger";

/**
 * Validation result
 */
interface ValidationResult {
  valid: boolean;
  error?: string;
  type?: string;
}

/**
 * Key management UI state
 */
interface KeyManagementUIState {
  activeTab: string;
  showAdvanced: boolean;
  exportPassword: string;
  importPassword: string;
  vaultPassword: string;
  showExportPassword: boolean;
  showImportPassword: boolean;
  showVaultPassword: boolean;
  keyFingerprint: string;
  copiedToClipboard: boolean;
  importResult: unknown;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

/**
 * Key management operations
 */
interface KeyManagementOperations {
  validateExportPassword: (password: string) => boolean;
  validateImportRequirements: (
    keyFileData: unknown,
    importPassword: string,
    vaultPassword: string,
    validation: ValidationResult
  ) => boolean;
  handleFileRead: (file: File) => Promise<unknown>;
  handleImportError: (err: Error) => void;
  handleOperationError: (operation: string, err: Error) => void;
}

/**
 * Hook for managing Key Management Settings UI state
 * Extracts UI state management from KeyManagementSettings component
 */
export const useKeyManagementUI = (): KeyManagementUIState & {
  handleTabChange: (tab: string) => void;
  toggleAdvanced: () => void;
  togglePasswordVisibility: (field: string) => void;
  updatePassword: (field: string, value: string) => void;
  resetState: () => void;
  handleClipboardSuccess: () => void;
  setKeyFingerprint: React.Dispatch<React.SetStateAction<string>>;
  setImportResult: React.Dispatch<React.SetStateAction<unknown>>;
} => {
  const [activeTab, setActiveTab] = useState<string>("export"); // export, import
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [exportPassword, setExportPassword] = useState<string>("");
  const [importPassword, setImportPassword] = useState<string>("");
  const [vaultPassword, setVaultPassword] = useState<string>("");
  const [showExportPassword, setShowExportPassword] = useState<boolean>(false);
  const [showImportPassword, setShowImportPassword] = useState<boolean>(false);
  const [showVaultPassword, setShowVaultPassword] = useState<boolean>(false);
  const [keyFingerprint, setKeyFingerprint] = useState<string>("");
  const [copiedToClipboard, setCopiedToClipboard] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<unknown>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const toggleAdvanced = useCallback(() => {
    setShowAdvanced((prev) => !prev);
  }, []);

  const togglePasswordVisibility = useCallback((field: string) => {
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

  const updatePassword = useCallback((field: string, value: string) => {
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
export const useKeyManagementOperations = (): KeyManagementOperations => {
  const validateExportPassword = useCallback((password: string) => {
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
    (
      _keyFileData: unknown,
      importPassword: string,
      vaultPassword: string,
      validation: ValidationResult
    ) => {
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

  const handleFileRead = useCallback(async (file: File) => {
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

  const handleImportError = useCallback((err: Error) => {
    logger.error("Import failed:", err);
    globalToast.showError(
      "Import failed: " + (err.message || "Unknown error"),
      "Import Failed",
      8000
    );
  }, []);

  const handleOperationError = useCallback((operation: string, err: Error) => {
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
