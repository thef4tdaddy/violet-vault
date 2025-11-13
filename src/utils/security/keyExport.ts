import { encryptionUtils } from "@/utils/security/encryption";
import logger from "@/utils/common/logger";

/**
 * VioletVault Key Export/Import Utilities
 * Provides secure ways to export and import encryption keys for backup and device sync
 */

// Type definitions for key export/import operations
export interface ExportedKeyData {
  version: string;
  type: string;
  keyData: number[];
  salt: number[];
  budgetId: string;
  fingerprint: string;
  exportedAt: string;
  deviceFingerprint: string;
}

export interface ProtectedKeyFile {
  version: string;
  type: string;
  encryptedKeyData: {
    data: Uint8Array;
    iv: Uint8Array;
  };
  exportSalt: number[];
  createdAt: string;
}

export interface ImportedKeyData {
  key: CryptoKey;
  salt: Uint8Array;
  budgetId: string;
  fingerprint: string;
  exportedAt: string;
  deviceFingerprint: string;
}

export interface ValidationResult {
  valid: boolean;
  type?: string;
  version?: string;
  exportedAt?: string;
  error?: string;
}

export const keyExportUtils = {
  /**
   * Generate a fingerprint hash of encryption key for verification
   * @param key - The encryption key to fingerprint
   * @returns SHA-256 hash of key as hex string
   */
  async generateKeyFingerprint(key: CryptoKey): Promise<string> {
    try {
      // Export key to get raw key material
      const keyData = await crypto.subtle.exportKey("raw", key);
      // Hash key data
      const hashBuffer = await crypto.subtle.digest("SHA-256", keyData);
      // Convert to hex string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate key fingerprint: ${errorMessage}`);
    }
  },

  /**
   * Export encryption key data for backup
   * @param key - The encryption key to export
   * @param salt - The salt used for key derivation
   * @param budgetId - The budget identifier
   * @returns Exportable key data
   */
  async exportKeyData(
    key: CryptoKey,
    salt: Uint8Array,
    budgetId: string
  ): Promise<ExportedKeyData> {
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to export key data: ${errorMessage}`);
    }
  },

  /**
   * Create password-protected key file
   * @param keyData - The key data from exportKeyData()
   * @param exportPassword - Password to encrypt export file
   * @returns Encrypted key file data
   */
  async createProtectedKeyFile(
    keyData: ExportedKeyData,
    exportPassword: string
  ): Promise<ProtectedKeyFile> {
    try {
      // Generate a new salt for export file encryption
      const exportSalt = crypto.getRandomValues(new Uint8Array(16));

      // Derive key from export password
      const exportKey = await encryptionUtils.deriveKeyFromSalt(exportPassword, exportSalt);

      // Encrypt key data
      const encryptedData = await encryptionUtils.encrypt(keyData, exportKey);

      const normalizedEncryptedData = {
        data:
          encryptedData.data instanceof Uint8Array
            ? encryptedData.data
            : new Uint8Array(encryptedData.data as unknown as number[]),
        iv:
          encryptedData.iv instanceof Uint8Array
            ? encryptedData.iv
            : new Uint8Array(encryptedData.iv as unknown as number[]),
      };

      return {
        version: "1.0",
        type: "violet-vault-protected-key",
        encryptedKeyData: normalizedEncryptedData,
        exportSalt: Array.from(exportSalt),
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create protected key file: ${errorMessage}`);
    }
  },

  /**
   * Import key data from backup
   * @param keyData - The exported key data
   * @returns Imported key data with key, salt, budgetId, and fingerprint
   */
  async importKeyData(keyData: unknown): Promise<ImportedKeyData> {
    try {
      // Type guard to ensure keyData has the expected structure
      if (!keyData || typeof keyData !== "object" || keyData === null) {
        throw new Error("Invalid key file format");
      }

      const keyDataObj = keyData as Record<string, unknown>;

      if (keyDataObj.type !== "violet-vault-key") {
        throw new Error("Invalid key file format");
      }

      if (keyDataObj.version !== "1.0") {
        throw new Error(`Unsupported key file version: ${String(keyDataObj.version)}`);
      }

      // Import raw key data
      const key = await crypto.subtle.importKey(
        "raw",
        new Uint8Array(keyDataObj.keyData as number[]),
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );

      // Verify fingerprint
      const fingerprint = await this.generateKeyFingerprint(key);
      if (fingerprint !== keyDataObj.fingerprint) {
        throw new Error("Key integrity verification failed - corrupted key file");
      }

      return {
        key,
        salt: new Uint8Array(keyDataObj.salt as number[]),
        budgetId: String(keyDataObj.budgetId),
        fingerprint: String(keyDataObj.fingerprint),
        exportedAt: String(keyDataObj.exportedAt),
        deviceFingerprint: String(keyDataObj.deviceFingerprint),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to import key data: ${errorMessage}`);
    }
  },

  /**
   * Import protected key file
   * @param protectedKeyFile - The encrypted key file
   * @param exportPassword - Password to decrypt file
   * @returns Imported key data
   */
  async importProtectedKeyFile(
    protectedKeyFile: unknown,
    exportPassword: string
  ): Promise<ImportedKeyData> {
    try {
      // Type guard to ensure protectedKeyFile has the expected structure
      if (!protectedKeyFile || typeof protectedKeyFile !== "object" || protectedKeyFile === null) {
        throw new Error("Invalid protected key file format");
      }

      const keyFileObj = protectedKeyFile as Record<string, unknown>;

      if (keyFileObj.type !== "violet-vault-protected-key") {
        throw new Error("Invalid protected key file format");
      }

      if (keyFileObj.version !== "1.0") {
        throw new Error(`Unsupported protected key file version: ${String(keyFileObj.version)}`);
      }

      // Derive decryption key
      const exportSalt = new Uint8Array(keyFileObj.exportSalt as number[]);
      const exportKey = await encryptionUtils.deriveKeyFromSalt(exportPassword, exportSalt);

      // Decrypt key data
      const encryptedKeyData = keyFileObj.encryptedKeyData as {
        data: Uint8Array;
        iv: Uint8Array;
      };

      const keyData = await encryptionUtils.decrypt(
        encryptedKeyData.data,
        exportKey,
        encryptedKeyData.iv
      );

      // Import decrypted key data
      return await this.importKeyData(keyData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to import protected key file: ${errorMessage}`);
    }
  },

  /**
   * Export key to clipboard (with auto-clear)
   * @param keyData - The key data to copy
   * @param clearAfterMs - Clear clipboard after this many milliseconds (default 30s)
   */
  async exportToClipboard(
    keyData: ExportedKeyData | ProtectedKeyFile,
    clearAfterMs = 30000
  ): Promise<boolean> {
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
          logger.warn("Could not auto-clear clipboard:", error);
        }
      }, clearAfterMs);

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to copy to clipboard: ${errorMessage}`);
    }
  },

  /**
   * Download key as file
   * @param keyData - The key data to download
   * @param filename - The filename (without extension)
   * @param isProtected - Whether this is a password-protected file
   */
  downloadKeyFile(
    keyData: ExportedKeyData | ProtectedKeyFile,
    filename = "violet-vault-key",
    isProtected = false
  ): boolean {
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to download key file: ${errorMessage}`);
    }
  },

  /**
   * Generate QR code data URL for key
   * @param keyData - The key data to encode
   * @returns Data URL for QR code image
   */
  async generateQRCode(keyData: ExportedKeyData): Promise<string> {
    try {
      const QRCode = await import("qrcode");
      const keyString = JSON.stringify(keyData);

      // For security, limit QR code to smaller key data
      if (keyString.length > 2000) {
        throw new Error("Key data too large for QR code - use file export instead");
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate QR code: ${errorMessage}`);
    }
  },

  /**
   * Validate key file format
   * @param keyFileData - The key file data to validate
   * @returns Validation result
   */
  validateKeyFile(keyFileData: unknown): ValidationResult {
    try {
      if (!keyFileData) {
        return { valid: false, error: "No key data provided" };
      }

      // Type guard to ensure keyFileData has the expected structure
      if (typeof keyFileData !== "object" || keyFileData === null) {
        return { valid: false, error: "Invalid key file format" };
      }

      const keyFileObj = keyFileData as Record<string, unknown>;

      const isProtected = keyFileObj.type === "violet-vault-protected-key";
      const isUnprotected = keyFileObj.type === "violet-vault-key";

      if (!isProtected && !isUnprotected) {
        return { valid: false, error: "Invalid key file type" };
      }

      if (keyFileObj.version !== "1.0") {
        return {
          valid: false,
          error: `Unsupported version: ${String(keyFileObj.version)}`,
        };
      }

      if (isUnprotected) {
        const requiredFields = ["keyData", "salt", "budgetId", "fingerprint"];
        for (const field of requiredFields) {
          if (!keyFileObj[field]) {
            return { valid: false, error: `Missing required field: ${field}` };
          }
        }
      }

      if (isProtected) {
        const requiredFields = ["encryptedKeyData", "exportSalt"];
        for (const field of requiredFields) {
          if (!keyFileObj[field]) {
            return { valid: false, error: `Missing required field: ${field}` };
          }
        }
      }

      return {
        valid: true,
        type: isProtected ? "protected" : "unprotected",
        version: String(keyFileObj.version),
        exportedAt: String(keyFileObj.exportedAt || keyFileObj.createdAt || ""),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { valid: false, error: `Validation failed: ${errorMessage}` };
    }
  },
};
