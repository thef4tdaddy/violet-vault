import { encryptionUtils } from "./encryption";

/**
 * VioletVault Key Export/Import Utilities
 * Provides secure ways to export and import encryption keys for backup and device sync
 */

export const keyExportUtils = {
  /**
   * Generate a fingerprint hash of the encryption key for verification
   * @param {CryptoKey} key - The encryption key to fingerprint
   * @returns {Promise<string>} SHA-256 hash of the key as hex string
   */
  async generateKeyFingerprint(key) {
    try {
      // Export key to get the raw key material
      const keyData = await crypto.subtle.exportKey("raw", key);
      // Hash the key data
      const hashBuffer = await crypto.subtle.digest("SHA-256", keyData);
      // Convert to hex string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (error) {
      throw new Error(`Failed to generate key fingerprint: ${error.message}`);
    }
  },

  /**
   * Export encryption key data for backup
   * @param {CryptoKey} key - The encryption key to export
   * @param {Uint8Array} salt - The salt used for key derivation
   * @param {string} budgetId - The budget identifier
   * @returns {Promise<Object>} Exportable key data
   */
  async exportKeyData(key, salt, budgetId) {
    try {
      const keyData = await crypto.subtle.exportKey("raw", key);
      const fingerprint = await this.generateKeyFingerprint(key);

      return {
        version: "1.0",
        type: "violet-vault-key",
        keyData: Array.from(new Uint8Array(keyData)),
        salt: Array.from(salt),
        budgetId: budgetId,
        fingerprint: fingerprint,
        exportedAt: new Date().toISOString(),
        deviceFingerprint: encryptionUtils.generateDeviceFingerprint(),
      };
    } catch (error) {
      throw new Error(`Failed to export key data: ${error.message}`);
    }
  },

  /**
   * Create password-protected key file
   * @param {Object} keyData - The key data from exportKeyData()
   * @param {string} exportPassword - Password to encrypt the export file
   * @returns {Promise<Object>} Encrypted key file data
   */
  async createProtectedKeyFile(keyData, exportPassword) {
    try {
      // Generate a new salt for the export file encryption
      const exportSalt = crypto.getRandomValues(new Uint8Array(16));

      // Derive key from export password
      const exportKey = await encryptionUtils.deriveKeyFromSalt(
        exportPassword,
        exportSalt,
      );

      // Encrypt the key data
      const encryptedData = await encryptionUtils.encrypt(keyData, exportKey);

      return {
        version: "1.0",
        type: "violet-vault-protected-key",
        encryptedKeyData: encryptedData,
        exportSalt: Array.from(exportSalt),
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to create protected key file: ${error.message}`);
    }
  },

  /**
   * Import key data from backup
   * @param {Object} keyData - The exported key data
   * @returns {Promise<{key: CryptoKey, salt: Uint8Array, budgetId: string, fingerprint: string}>}
   */
  async importKeyData(keyData) {
    try {
      if (!keyData || keyData.type !== "violet-vault-key") {
        throw new Error("Invalid key file format");
      }

      if (keyData.version !== "1.0") {
        throw new Error(`Unsupported key file version: ${keyData.version}`);
      }

      // Import the raw key data
      const key = await crypto.subtle.importKey(
        "raw",
        new Uint8Array(keyData.keyData),
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"],
      );

      // Verify fingerprint
      const fingerprint = await this.generateKeyFingerprint(key);
      if (fingerprint !== keyData.fingerprint) {
        throw new Error(
          "Key integrity verification failed - corrupted key file",
        );
      }

      return {
        key,
        salt: new Uint8Array(keyData.salt),
        budgetId: keyData.budgetId,
        fingerprint: keyData.fingerprint,
        exportedAt: keyData.exportedAt,
        deviceFingerprint: keyData.deviceFingerprint,
      };
    } catch (error) {
      throw new Error(`Failed to import key data: ${error.message}`);
    }
  },

  /**
   * Import protected key file
   * @param {Object} protectedKeyFile - The encrypted key file
   * @param {string} exportPassword - Password to decrypt the file
   * @returns {Promise<Object>} Imported key data
   */
  async importProtectedKeyFile(protectedKeyFile, exportPassword) {
    try {
      if (
        !protectedKeyFile ||
        protectedKeyFile.type !== "violet-vault-protected-key"
      ) {
        throw new Error("Invalid protected key file format");
      }

      if (protectedKeyFile.version !== "1.0") {
        throw new Error(
          `Unsupported protected key file version: ${protectedKeyFile.version}`,
        );
      }

      // Derive decryption key
      const exportSalt = new Uint8Array(protectedKeyFile.exportSalt);
      const exportKey = await encryptionUtils.deriveKeyFromSalt(
        exportPassword,
        exportSalt,
      );

      // Decrypt the key data
      const keyData = await encryptionUtils.decrypt(
        protectedKeyFile.encryptedKeyData.data,
        exportKey,
        protectedKeyFile.encryptedKeyData.iv,
      );

      // Import the decrypted key data
      return await this.importKeyData(keyData);
    } catch (error) {
      throw new Error(`Failed to import protected key file: ${error.message}`);
    }
  },

  /**
   * Export key to clipboard (with auto-clear)
   * @param {Object} keyData - The key data to copy
   * @param {number} clearAfterMs - Clear clipboard after this many milliseconds (default 30s)
   */
  async exportToClipboard(keyData, clearAfterMs = 30000) {
    try {
      const keyString = JSON.stringify(keyData, null, 2);
      await navigator.clipboard.writeText(keyString);

      // Auto-clear clipboard after specified time
      setTimeout(async () => {
        try {
          const currentClipboard = await navigator.clipboard.readText();
          if (currentClipboard === keyString) {
            await navigator.clipboard.writeText("");
          }
        } catch (error) {
          console.warn("Could not auto-clear clipboard:", error);
        }
      }, clearAfterMs);

      return true;
    } catch (error) {
      throw new Error(`Failed to copy to clipboard: ${error.message}`);
    }
  },

  /**
   * Download key as file
   * @param {Object} keyData - The key data to download
   * @param {string} filename - The filename (without extension)
   * @param {boolean} isProtected - Whether this is a password-protected file
   */
  downloadKeyFile(keyData, filename = "violet-vault-key", isProtected = false) {
    try {
      const extension = isProtected ? ".vaultkey" : ".json";
      const blob = new Blob([JSON.stringify(keyData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      throw new Error(`Failed to download key file: ${error.message}`);
    }
  },

  /**
   * Generate QR code data URL for key
   * @param {Object} keyData - The key data to encode
   * @returns {Promise<string>} Data URL for QR code image
   */
  async generateQRCode(keyData) {
    try {
      const QRCode = await import("qrcode");
      const keyString = JSON.stringify(keyData);

      // For security, limit QR code to smaller key data
      if (keyString.length > 2000) {
        throw new Error(
          "Key data too large for QR code - use file export instead",
        );
      }

      // Generate QR code with high error correction for better scanning reliability
      return await QRCode.toDataURL(keyString, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: "H", // High error correction
        type: "image/png",
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  },

  /**
   * Validate key file format
   * @param {Object} keyFileData - The key file data to validate
   * @returns {Object} Validation result
   */
  validateKeyFile(keyFileData) {
    try {
      if (!keyFileData) {
        return { valid: false, error: "No key data provided" };
      }

      const isProtected = keyFileData.type === "violet-vault-protected-key";
      const isUnprotected = keyFileData.type === "violet-vault-key";

      if (!isProtected && !isUnprotected) {
        return { valid: false, error: "Invalid key file type" };
      }

      if (keyFileData.version !== "1.0") {
        return {
          valid: false,
          error: `Unsupported version: ${keyFileData.version}`,
        };
      }

      if (isUnprotected) {
        const requiredFields = ["keyData", "salt", "budgetId", "fingerprint"];
        for (const field of requiredFields) {
          if (!keyFileData[field]) {
            return { valid: false, error: `Missing required field: ${field}` };
          }
        }
      }

      if (isProtected) {
        const requiredFields = ["encryptedKeyData", "exportSalt"];
        for (const field of requiredFields) {
          if (!keyFileData[field]) {
            return { valid: false, error: `Missing required field: ${field}` };
          }
        }
      }

      return {
        valid: true,
        type: isProtected ? "protected" : "unprotected",
        version: keyFileData.version,
        exportedAt: keyFileData.exportedAt || keyFileData.createdAt,
      };
    } catch (error) {
      return { valid: false, error: `Validation failed: ${error.message}` };
    }
  },
};
