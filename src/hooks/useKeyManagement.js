import { useState, useCallback } from "react";
import { useAuth } from "../stores/authStore.jsx";
import { keyExportUtils } from "../utils/keyExport";
import logger from "../utils/logger";

/**
 * Hook for managing encryption key export/import operations
 * Provides secure methods to backup and restore encryption keys
 */
export const useKeyManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);

  const { encryptionKey, salt, budgetId, login } = useAuth();

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
  const exportKey = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!encryptionKey || !salt || !budgetId) {
        throw new Error("No encryption key available - please login first");
      }

      const keyData = await keyExportUtils.exportKeyData(
        encryptionKey,
        salt,
        budgetId,
      );
      logger.debug("Key exported successfully", {
        fingerprint: keyData.fingerprint.substring(0, 8),
        budgetId: keyData.budgetId,
      });

      return keyData;
    } catch (err) {
      const errorMessage = `Failed to export key: ${err.message}`;
      setError(errorMessage);
      logger.error("Key export failed", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [encryptionKey, salt, budgetId]);

  /**
   * Export key as password-protected file
   */
  const exportProtectedKey = useCallback(
    async (exportPassword) => {
      try {
        setLoading(true);
        setError(null);

        if (!exportPassword || exportPassword.length < 8) {
          throw new Error("Export password must be at least 8 characters long");
        }

        const keyData = await exportKey();
        const protectedKeyFile = await keyExportUtils.createProtectedKeyFile(
          keyData,
          exportPassword,
        );

        logger.debug("Protected key file created successfully");
        return protectedKeyFile;
      } catch (err) {
        const errorMessage = `Failed to create protected key file: ${err.message}`;
        setError(errorMessage);
        logger.error("Protected key export failed", err);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [exportKey],
  );

  /**
   * Copy key to clipboard (auto-clears after 30 seconds)
   */
  const copyKeyToClipboard = useCallback(
    async (clearAfterSeconds = 30) => {
      try {
        setLoading(true);
        setError(null);

        const keyData = await exportKey();
        await keyExportUtils.exportToClipboard(
          keyData,
          clearAfterSeconds * 1000,
        );

        logger.debug("Key copied to clipboard", {
          clearAfterSeconds,
          fingerprint: keyData.fingerprint.substring(0, 8),
        });

        return {
          success: true,
          clearAfterSeconds,
          fingerprint: keyData.fingerprint,
        };
      } catch (err) {
        const errorMessage = `Failed to copy key to clipboard: ${err.message}`;
        setError(errorMessage);
        logger.error("Clipboard copy failed", err);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [exportKey],
  );

  /**
   * Download key as JSON file
   */
  const downloadKeyFile = useCallback(
    async (filename = "violet-vault-backup") => {
      try {
        setLoading(true);
        setError(null);

        const keyData = await exportKey();
        keyExportUtils.downloadKeyFile(keyData, filename, false);

        logger.debug("Key file downloaded", {
          filename,
          fingerprint: keyData.fingerprint.substring(0, 8),
        });

        return { success: true, filename: `${filename}.json` };
      } catch (err) {
        const errorMessage = `Failed to download key file: ${err.message}`;
        setError(errorMessage);
        logger.error("Key file download failed", err);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [exportKey],
  );

  /**
   * Download password-protected key file
   */
  const downloadProtectedKeyFile = useCallback(
    async (exportPassword, filename = "violet-vault-backup") => {
      try {
        setLoading(true);
        setError(null);

        const protectedKeyFile = await exportProtectedKey(exportPassword);
        keyExportUtils.downloadKeyFile(protectedKeyFile, filename, true);

        logger.debug("Protected key file downloaded", { filename });
        return { success: true, filename: `${filename}.vaultkey` };
      } catch (err) {
        const errorMessage = `Failed to download protected key file: ${err.message}`;
        setError(errorMessage);
        logger.error("Protected key file download failed", err);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [exportProtectedKey],
  );

  /**
   * Generate QR code for key
   */
  const generateQRCode = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const keyData = await exportKey();
      const qrUrl = await keyExportUtils.generateQRCode(keyData);
      setQrCodeUrl(qrUrl);

      logger.debug("QR code generated", {
        fingerprint: keyData.fingerprint.substring(0, 8),
      });

      return { success: true, qrUrl };
    } catch (err) {
      const errorMessage = `Failed to generate QR code: ${err.message}`;
      setError(errorMessage);
      logger.error("QR code generation failed", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [exportKey]);

  /**
   * Import key from file data
   */
  const importKey = useCallback(async (keyFileData, importPassword = null) => {
    try {
      setLoading(true);
      setError(null);

      // Validate the key file
      const validation = keyExportUtils.validateKeyFile(keyFileData);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      let importedKeyData;

      if (validation.type === "protected") {
        if (!importPassword) {
          throw new Error("Password required to import protected key file");
        }
        importedKeyData = await keyExportUtils.importProtectedKeyFile(
          keyFileData,
          importPassword,
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
    } catch (err) {
      const errorMessage = `Failed to import key: ${err.message}`;
      setError(errorMessage);
      logger.error("Key import failed", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Import key and immediately login with it
   */
  const importAndLogin = useCallback(
    async (keyFileData, importPassword = null, vaultPassword) => {
      try {
        setLoading(true);
        setError(null);

        if (!vaultPassword) {
          throw new Error("Vault password required to login after import");
        }

        const importResult = await importKey(keyFileData, importPassword);

        // Attempt to login with the imported key data
        // We need to reconstruct the login process with the imported salt and budgetId
        const loginResult = await login(vaultPassword, {
          budgetId: importResult.budgetId,
          importedSalt: importResult.importedKeyData.salt,
        });

        if (!loginResult.success) {
          throw new Error(
            "Failed to login with imported key - password may be incorrect",
          );
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
      } catch (err) {
        const errorMessage = `Failed to import and login: ${err.message}`;
        setError(errorMessage);
        logger.error("Import and login failed", err);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [importKey, login],
  );

  /**
   * Get current key fingerprint for verification
   */
  const getCurrentKeyFingerprint = useCallback(async () => {
    try {
      if (!encryptionKey) {
        throw new Error("No encryption key available");
      }

      const fingerprint =
        await keyExportUtils.generateKeyFingerprint(encryptionKey);
      return fingerprint;
    } catch (err) {
      logger.error("Failed to get key fingerprint", err);
      throw new Error(`Failed to get key fingerprint: ${err.message}`);
    }
  }, [encryptionKey]);

  /**
   * Verify if a key file matches current key
   */
  const verifyKeyMatch = useCallback(
    async (keyFileData, importPassword = null) => {
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
        throw new Error(`Key verification failed: ${err.message}`);
      }
    },
    [getCurrentKeyFingerprint, importKey],
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
