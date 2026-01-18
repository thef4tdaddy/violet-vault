import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { keyExportUtils } from "@/utils/platform/security/keyExport";
import logger from "@/utils/core/common/logger";
import {
  withAsyncOperation,
  validateEncryptionContext,
  validateExportPassword,
} from "@/utils/platform/security/asyncOperationHelpers";

import type {
  ExportedKeyData,
  ProtectedKeyFile,
  ImportedKeyData,
} from "@/utils/platform/security/keyExport";

/**
 * Hook for managing encryption key export/import operations
 * Provides secure methods to backup and restore encryption keys
 *
 * Migration from old Zustand authStore - Part of Epic #665
 */
export const useKeyManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // Use unified useAuth hook for both state and operations
  const auth = useAuth();
  const { encryptionKey, salt, budgetId, login } = auth;

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear QR code
  const clearQrCode = useCallback(() => {
    setQrCodeUrl(null);
  }, []);

  /**
   * Export current encryption key as unprotected JSON
   */
  const exportKey = useCallback(async (): Promise<ExportedKeyData> => {
    return withAsyncOperation(
      async () => {
        validateEncryptionContext(encryptionKey, salt, budgetId);
        // After validation, we know these are non-null
        const keyData = await keyExportUtils.exportKeyData(encryptionKey!, salt!, budgetId!);
        logger.debug("Key exported successfully", {
          fingerprint: keyData.fingerprint.substring(0, 8),
          budgetId: keyData.budgetId,
        });

        return keyData;
      },
      { setLoading, setError },
      "Failed to export key"
    );
  }, [encryptionKey, salt, budgetId]);

  /**
   * Export key as password-protected file
   */
  const exportProtectedKey = useCallback(
    async (exportPassword: string): Promise<ProtectedKeyFile> => {
      return withAsyncOperation(
        async () => {
          validateExportPassword(exportPassword);

          const keyData = await exportKey();
          const protectedKeyFile = await keyExportUtils.createProtectedKeyFile(
            keyData,
            exportPassword
          );

          logger.debug("Protected key file created successfully");
          return protectedKeyFile;
        },
        { setLoading, setError },
        "Failed to create protected key file"
      );
    },
    [exportKey]
  );

  /**
   * Copy key to clipboard (auto-clears after 30 seconds)
   */
  const copyKeyToClipboard = useCallback(
    async (
      clearAfterSeconds = 30
    ): Promise<{ success: boolean; clearAfterSeconds: number; fingerprint: string }> => {
      return withAsyncOperation(
        async () => {
          const keyData = await exportKey();
          await keyExportUtils.exportToClipboard(keyData, clearAfterSeconds * 1000);

          logger.debug("Key copied to clipboard", {
            clearAfterSeconds,
            fingerprint: keyData.fingerprint.substring(0, 8),
          });

          return {
            success: true,
            clearAfterSeconds,
            fingerprint: keyData.fingerprint,
          };
        },
        { setLoading, setError },
        "Failed to copy key to clipboard"
      );
    },
    [exportKey]
  );

  /**
   * Download key as JSON file
   */
  const downloadKeyFile = useCallback(
    async (filename = "violet-vault-backup"): Promise<{ success: boolean; filename: string }> => {
      return withAsyncOperation(
        async () => {
          const keyData = await exportKey();
          keyExportUtils.downloadKeyFile(keyData, filename, false);

          logger.debug("Key file downloaded", {
            filename,
            fingerprint: keyData.fingerprint.substring(0, 8),
          });

          return { success: true, filename: `${filename}.json` };
        },
        { setLoading, setError },
        "Failed to download key file"
      );
    },
    [exportKey]
  );

  /**
   * Download password-protected key file
   */
  const downloadProtectedKeyFile = useCallback(
    async (
      exportPassword: string,
      filename = "violet-vault-backup"
    ): Promise<{ success: boolean; filename: string }> => {
      return withAsyncOperation(
        async () => {
          const protectedKeyFile = await exportProtectedKey(exportPassword);
          keyExportUtils.downloadKeyFile(protectedKeyFile, filename, true);

          logger.debug("Protected key file downloaded", { filename });
          return { success: true, filename: `${filename}.vaultkey` };
        },
        { setLoading, setError },
        "Failed to download protected key file"
      );
    },
    [exportProtectedKey]
  );

  /**
   * Generate QR code for key
   */
  const generateQRCode = useCallback(async (): Promise<{ success: boolean; qrUrl: string }> => {
    return withAsyncOperation(
      async () => {
        const keyData = await exportKey();
        const qrUrl = await keyExportUtils.generateQRCode(keyData);
        setQrCodeUrl(qrUrl);

        logger.debug("QR code generated", {
          fingerprint: keyData.fingerprint.substring(0, 8),
        });

        return { success: true, qrUrl };
      },
      { setLoading, setError },
      "Failed to generate QR code"
    );
  }, [exportKey]);

  /**
   * Import key from file data
   */
  const importKey = useCallback(
    async (
      keyFileData: Record<string, unknown> | Uint8Array,
      importPassword: string | null = null
    ): Promise<{
      success: boolean;
      budgetId: string;
      fingerprint: string;
      exportedAt: string;
      deviceFingerprint: string;
      importedKeyData: ImportedKeyData;
    }> => {
      return withAsyncOperation(
        async () => {
          // Validate the key file
          const validation = keyExportUtils.validateKeyFile(keyFileData);
          if (!validation.valid) {
            throw new Error(validation.error || "Invalid key file");
          }

          let importedKeyData: ImportedKeyData;

          if (validation.type === "protected") {
            if (!importPassword) {
              throw new Error("Password required to import protected key file");
            }
            importedKeyData = await keyExportUtils.importProtectedKeyFile(
              keyFileData,
              importPassword
            );
          } else {
            importedKeyData = await keyExportUtils.importKeyData(keyFileData);
          }

          logger.debug("Key imported successfully", {
            budgetId: importedKeyData.budgetId,
            fingerprint: importedKeyData.fingerprint.substring(0, 8),
            type: validation.type,
          });

          return {
            success: true,
            budgetId: importedKeyData.budgetId,
            fingerprint: importedKeyData.fingerprint,
            exportedAt: importedKeyData.exportedAt,
            deviceFingerprint: importedKeyData.deviceFingerprint,
            importedKeyData,
          };
        },
        { setLoading, setError },
        "Failed to import key"
      );
    },
    []
  );

  /**
   * Import key and immediately login with it
   */
  const importAndLogin = useCallback(
    async (
      keyFileData: Record<string, unknown> | Uint8Array,
      importPassword: string | null = null,
      vaultPassword: string
    ): Promise<{
      success: boolean;
      importResult: {
        success: boolean;
        budgetId: string;
        fingerprint: string;
        exportedAt: string;
        deviceFingerprint: string;
        importedKeyData: ImportedKeyData;
      };
      loginResult: { success: boolean };
    }> => {
      return withAsyncOperation(
        async () => {
          if (!vaultPassword) {
            throw new Error("Vault password required to login after import");
          }

          const importResult = await importKey(keyFileData, importPassword);

          // Attempt to login with the imported key data
          // We need to reconstruct the login process with the imported salt and budgetId
          const loginResult = await login({
            password: vaultPassword,
            overrideSalt: Array.from(importResult.importedKeyData.salt),
            overrideBudgetId: importResult.budgetId,
          });

          if (!loginResult.success) {
            throw new Error("Failed to login with imported key - password may be incorrect");
          }

          logger.debug("Import and login successful", {
            budgetId: importResult.budgetId,
            fingerprint: importResult.fingerprint.substring(0, 8),
          });

          return {
            success: true,
            importResult,
            loginResult,
          };
        },
        { setLoading, setError },
        "Failed to import and login"
      );
    },
    [importKey, login]
  );

  /**
   * Get current key fingerprint for verification
   */
  const getCurrentKeyFingerprint = useCallback(async (): Promise<string> => {
    try {
      if (!encryptionKey) {
        throw new Error("No encryption key available");
      }

      const fingerprint = await keyExportUtils.generateKeyFingerprint(encryptionKey);
      return fingerprint;
    } catch (err) {
      logger.error("Failed to get key fingerprint", err);
      throw new Error(
        `Failed to get key fingerprint: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [encryptionKey]);

  /**
   * Verify if a key file matches current key
   */
  const verifyKeyMatch = useCallback(
    async (
      keyFileData: Record<string, unknown> | Uint8Array,
      importPassword: string | null = null
    ): Promise<{
      matches: boolean;
      currentFingerprint: string;
      importedFingerprint: string;
    }> => {
      try {
        const currentFingerprint = await getCurrentKeyFingerprint();
        const importResult = await importKey(keyFileData, importPassword);

        return {
          matches: currentFingerprint === importResult.fingerprint,
          currentFingerprint,
          importedFingerprint: importResult.fingerprint,
        };
      } catch (err) {
        logger.error("Key verification failed", err);
        throw new Error(
          `Key verification failed: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    },
    [getCurrentKeyFingerprint, importKey]
  );

  return {
    // State
    loading,
    error,
    qrCodeUrl,

    // Actions
    clearError,
    clearQrCode,

    // Export functions
    exportKey,
    exportProtectedKey,
    copyKeyToClipboard,
    downloadKeyFile,
    downloadProtectedKeyFile,
    generateQRCode,

    // Import functions
    importKey,
    importAndLogin,

    // Verification functions
    getCurrentKeyFingerprint,
    verifyKeyMatch,

    // Utility
    validateKeyFile: keyExportUtils.validateKeyFile,
  };
};
