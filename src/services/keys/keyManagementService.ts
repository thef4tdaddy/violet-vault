import { encryptionUtils } from "@/utils/security/encryption";
import logger from "@/utils/common/logger";

export interface KeyFileData {
  version?: string;
  type?: "protected" | "unprotected";
  key?: number[];
  salt?: number[];
  encryptedKey?: number[];
  exportSalt?: number[];
  [key: string]: unknown;
}

/**
 * Key Management Service
 * Handles encryption key operations, import/export, and validation
 *
 * IMPORTANT: This service is now parameter-driven instead of using hooks.
 * Pass auth data (encryptionKey, salt, currentUser, budgetId) from AuthContext
 * to each method. This keeps the service layer separate from React hooks.
 *
 * Migration from old Zustand authStore - Part of Epic #665
 */
class KeyManagementService {
  /**
   * Generate a cryptographic fingerprint for the current encryption key
   * @param encryptionKey - The encryption key to fingerprint (from AuthContext)
   */
  async getCurrentKeyFingerprint(encryptionKey: CryptoKey | Uint8Array) {
    try {
      if (!encryptionKey) {
        throw new Error("Encryption key is required");
      }

      // Create a fingerprint using the key data
      let bufferToHash: Uint8Array;

      if (typeof encryptionKey === "string") {
        bufferToHash = new TextEncoder().encode(encryptionKey);
      } else if (encryptionKey instanceof Uint8Array) {
        bufferToHash = encryptionKey;
      } else {
        // CryptoKey - export it first
        const exported = await crypto.subtle.exportKey("raw", encryptionKey);
        // Copy to a new ArrayBuffer to ensure it's not SharedArrayBuffer
        const tempArray = new Uint8Array(exported);
        const newBuffer = new ArrayBuffer(tempArray.length);
        bufferToHash = new Uint8Array(newBuffer);
        bufferToHash.set(tempArray);
      }

      // Create a pure ArrayBuffer copy to avoid SharedArrayBuffer issues
      const pureBuffer = new ArrayBuffer(bufferToHash.length);
      new Uint8Array(pureBuffer).set(bufferToHash);
      const hashBuffer = await crypto.subtle.digest("SHA-256", pureBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      // Format as fingerprint (8 groups of 4 hex chars)
      const fingerprint =
        hashHex
          .match(/.{1,4}/g)
          ?.slice(0, 8)
          .join("-") || hashHex.substring(0, 32);

      logger.debug("Generated key fingerprint:", {
        fingerprint: fingerprint.substring(0, 12) + "...",
      });
      return fingerprint;
    } catch (error) {
      logger.error("Failed to generate key fingerprint:", error);
      throw new Error("Failed to generate key fingerprint: " + (error as Error).message);
    }
  }

  /**
   * Copy the current encryption key to clipboard with auto-clear
   * @param encryptionKey - The encryption key (from AuthContext)
   * @param salt - The salt value (from AuthContext)
   * @param clearTimeoutSeconds - Seconds before auto-clearing clipboard
   */
  async copyKeyToClipboard(
    encryptionKey: CryptoKey | Uint8Array,
    salt: Uint8Array,
    clearTimeoutSeconds = 30
  ) {
    try {
      if (!encryptionKey || !salt) {
        throw new Error("Encryption key and salt are required");
      }

      const keyData = {
        key: Array.from(encryptionKey as Uint8Array),
        salt: Array.from(salt),
        timestamp: new Date().toISOString(),
        type: "unprotected",
        version: "1.0",
      };

      await navigator.clipboard.writeText(JSON.stringify(keyData, null, 2));

      // Auto-clear clipboard after timeout
      setTimeout(async () => {
        try {
          const currentClipboard = await navigator.clipboard.readText();
          if (currentClipboard === JSON.stringify(keyData, null, 2)) {
            await navigator.clipboard.writeText("");
            logger.debug("Clipboard auto-cleared after timeout");
          }
        } catch (err) {
          logger.warn("Could not auto-clear clipboard:", {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }, clearTimeoutSeconds * 1000);

      logger.debug("Key copied to clipboard with auto-clear timeout:", {
        clearTimeoutSeconds,
      });
    } catch (error) {
      logger.error("Failed to copy key to clipboard:", error);
      throw new Error("Failed to copy to clipboard: " + (error as Error).message);
    }
  }

  /**
   * Download unprotected key file
   * @param encryptionKey - The encryption key (from AuthContext)
   * @param salt - The salt value (from AuthContext)
   * @param currentUser - The current user (from AuthContext)
   * @param budgetId - The budget ID (from AuthContext)
   */
  async downloadKeyFile(
    encryptionKey: CryptoKey | Uint8Array,
    salt: Uint8Array,
    currentUser?: string,
    budgetId?: string
  ) {
    try {
      if (!encryptionKey || !salt) {
        throw new Error("Encryption key and salt are required");
      }

      const keyData = {
        key: Array.from(encryptionKey as Uint8Array),
        salt: Array.from(salt),
        user: currentUser,
        budgetId: budgetId,
        timestamp: new Date().toISOString(),
        type: "unprotected",
        version: "1.0",
      };

      const blob = new Blob([JSON.stringify(keyData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `violetVault-key-${currentUser || "unknown"}-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      logger.debug("Unprotected key file downloaded");
    } catch (error) {
      logger.error("Failed to download key file:", error);
      throw new Error("Failed to download key file: " + (error as Error).message);
    }
  }

  /**
   * Download password-protected key file
   * @param encryptionKey - The encryption key (from AuthContext)
   * @param salt - The salt value (from AuthContext)
   * @param exportPassword - Password to protect the export
   * @param currentUser - The current user (from AuthContext)
   * @param budgetId - The budget ID (from AuthContext)
   */
  async downloadProtectedKeyFile(
    encryptionKey: CryptoKey | Uint8Array,
    salt: Uint8Array,
    exportPassword: string,
    currentUser?: string,
    budgetId?: string
  ) {
    try {
      if (!encryptionKey || !salt) {
        throw new Error("Encryption key and salt are required");
      }

      if (!exportPassword || exportPassword.length < 8) {
        throw new Error("Export password must be at least 8 characters long");
      }

      // Derive key from export password
      const exportKeyData = await encryptionUtils.deriveKey(exportPassword);

      // Encrypt the main key and salt
      const keyArray = Array.from(encryptionKey as Uint8Array);
      const saltArray = Array.from(salt);
      const dataToEncrypt = JSON.stringify({ key: keyArray, salt: saltArray });

      const encryptedData = await encryptionUtils.encrypt(dataToEncrypt, exportKeyData.key);

      const protectedKeyData = {
        encryptedKey: encryptedData,
        exportSalt: Array.from(exportKeyData.salt),
        user: currentUser,
        budgetId: budgetId,
        timestamp: new Date().toISOString(),
        type: "protected",
        version: "1.0",
      };

      const blob = new Blob([JSON.stringify(protectedKeyData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `violetVault-key-protected-${currentUser || "unknown"}-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      logger.debug("Protected key file downloaded");
    } catch (error) {
      logger.error("Failed to download protected key file:", error);
      throw new Error("Failed to download protected key file: " + (error as Error).message);
    }
  }

  /**
   * Generate QR code for key sharing
   * @param encryptionKey - The encryption key (from AuthContext)
   * @param salt - The salt value (from AuthContext)
   */
  async generateQRCode(encryptionKey: CryptoKey | Uint8Array, salt: Uint8Array) {
    try {
      if (!encryptionKey || !salt) {
        throw new Error("Encryption key and salt are required");
      }

      const keyData = {
        key: Array.from(encryptionKey as Uint8Array),
        salt: Array.from(salt),
        timestamp: new Date().toISOString(),
        type: "qr",
        version: "1.0",
      };

      const dataString = JSON.stringify(keyData);

      // Check if data is too large for QR code
      if (dataString.length > 2000) {
        logger.warn("Key data too large for QR code:", {
          length: dataString.length,
        });
        throw new Error("Key data is too large for QR code generation");
      }

      // Generate QR code URL (would need QR code library in real implementation)
      const qrCodeUrl = `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
          <rect width="200" height="200" fill="white"/>
          <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12" fill="black">
            QR Code would be here
          </text>
        </svg>
      `)}`;

      logger.debug("QR code generated (placeholder)");
      return qrCodeUrl;
    } catch (error) {
      logger.error("Failed to generate QR code:", error);
      throw new Error("Failed to generate QR code: " + (error as Error).message);
    }
  }

  /**
   * Validate key file structure and format
   */
  validateKeyFile(keyFileData: KeyFileData) {
    try {
      if (!keyFileData || typeof keyFileData !== "object") {
        return { valid: false, error: "Invalid file format" };
      }

      if (!keyFileData.version) {
        return { valid: false, error: "Missing version information" };
      }

      if (!keyFileData.type) {
        return { valid: false, error: "Missing key type information" };
      }

      if (keyFileData.type === "protected") {
        if (!keyFileData.encryptedKey || !keyFileData.exportSalt) {
          return { valid: false, error: "Invalid protected key format" };
        }
      } else if (keyFileData.type === "unprotected") {
        if (!keyFileData.key || !keyFileData.salt) {
          return { valid: false, error: "Invalid unprotected key format" };
        }
        if (!Array.isArray(keyFileData.key) || !Array.isArray(keyFileData.salt)) {
          return { valid: false, error: "Key or salt must be arrays" };
        }
      } else {
        return { valid: false, error: "Unknown key type: " + keyFileData.type };
      }

      return { valid: true, type: keyFileData.type };
    } catch (error) {
      logger.error("Key file validation error:", error);
      return { valid: false, error: "Validation failed: " + (error as Error).message };
    }
  }

  /**
   * Import key file and perform login
   * Note: The actual login is now handled by useAuthManager hook.
   * This method just validates and processes the key data.
   *
   * @param keyFileData - The imported key file data
   * @param importPassword - Password for protected key files
   * @returns Processed key data ready for login
   */
  async importKeyData(keyFileData: KeyFileData, importPassword?: string) {
    try {
      logger.debug("Starting key import process");

      let keyData, saltData;

      if (keyFileData.type === "protected") {
        if (!importPassword) {
          throw new Error("Import password required for protected key file");
        }

        if (!keyFileData.exportSalt) {
          throw new Error("Export salt missing from protected key file");
        }

        // Derive key from import password using the salt
        const importKeyData = await encryptionUtils.deriveKeyFromSalt(
          importPassword,
          new Uint8Array(keyFileData.exportSalt)
        );

        if (!keyFileData.encryptedKey) {
          throw new Error("Encrypted key missing from protected key file");
        }

        // Decrypt the key and salt
        const decryptedData = await encryptionUtils.decrypt(
          keyFileData.encryptedKey,
          importKeyData.key,
          keyFileData.iv as number[]
        );
        const parsedData = JSON.parse(decryptedData);

        keyData = new Uint8Array(parsedData.key);
        saltData = new Uint8Array(parsedData.salt);
      } else {
        if (!keyFileData.key || !keyFileData.salt) {
          throw new Error("Key or salt missing from unprotected key file");
        }
        keyData = new Uint8Array(keyFileData.key);
        saltData = new Uint8Array(keyFileData.salt);
      }

      // Return processed data for caller to use with auth system
      const result = {
        encryptionKey: keyData,
        salt: saltData,
        currentUser: keyFileData.user || "imported-user",
        budgetId: keyFileData.budgetId || `imported-${Date.now()}`,
        timestamp: keyFileData.timestamp || new Date().toISOString(),
      };

      logger.debug("Key import data processed successfully");
      return result;
    } catch (error) {
      logger.error("Key import failed:", error);
      throw new Error("Import failed: " + (error as Error).message);
    }
  }
}

export const keyManagementService = new KeyManagementService();
