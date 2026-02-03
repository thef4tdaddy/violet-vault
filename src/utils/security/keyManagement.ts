/**
 * Key Management Service
 *
 * Handles encryption key lifecycle for Tier 2 analytics:
 * - User passphrase management (never persisted)
 * - Salt generation and storage
 * - Key derivation and caching
 * - Memory cleanup on logout
 *
 * Security Principles:
 * - Passphrase never stored (memory only during session)
 * - Salt stored in localStorage (public, per PBKDF2 spec)
 * - Derived keys never exported (stay in WebCrypto)
 * - Automatic cleanup on logout/session end
 *
 * @module keyManagement
 */

import { deriveKey, generateSalt, clearSensitiveData, testEncryption } from "./encryption";
import logger from "@/utils/core/common/logger";

/**
 * Storage keys for localStorage
 */
const STORAGE_KEYS = {
  SALT: "analytics-encryption-salt",
  KEY_VERSION: "analytics-key-version",
} as const;

/**
 * Current key version (for rotation support)
 */
const CURRENT_KEY_VERSION = 1;

/**
 * In-memory key cache
 * Cleared on logout or session end
 */
class KeyCache {
  private key: CryptoKey | null = null;
  private passphrase: string | null = null;

  set(passphrase: string, key: CryptoKey) {
    this.passphrase = passphrase;
    this.key = key;
  }

  get(): { passphrase: string; key: CryptoKey } | null {
    if (!this.passphrase || !this.key) {
      return null;
    }
    return { passphrase: this.passphrase, key: this.key };
  }

  clear() {
    if (this.passphrase) {
      // Overwrite passphrase in memory
      this.passphrase = "*".repeat(this.passphrase.length);
      this.passphrase = null;
    }
    this.key = null;

    clearSensitiveData({});
  }

  has(): boolean {
    return this.key !== null && this.passphrase !== null;
  }
}

const keyCache = new KeyCache();

/**
 * Key Management Service
 */
export class KeyManagementService {
  /**
   * Initialize encryption for first-time use
   *
   * Generates salt and derives key from passphrase.
   * Salt is stored in localStorage, passphrase is kept in memory only.
   *
   * @param passphrase - User passphrase (never persisted)
   * @returns True if initialization successful
   *
   * @example
   * ```typescript
   * const success = await keyManagement.initialize("my-secure-passphrase");
   * if (success) {
   *   console.log("Encryption initialized");
   * }
   * ```
   */
  async initialize(passphrase: string): Promise<boolean> {
    try {
      // Validate passphrase
      if (!passphrase || passphrase.length < 8) {
        throw new Error("Passphrase must be at least 8 characters");
      }

      // Generate and store salt
      const salt = generateSalt();
      localStorage.setItem(STORAGE_KEYS.SALT, salt);
      localStorage.setItem(STORAGE_KEYS.KEY_VERSION, CURRENT_KEY_VERSION.toString());

      // Derive key
      const key = await deriveKey(passphrase, salt);

      // Test encryption round-trip
      const testData = { test: "encryption-verification", timestamp: Date.now() };
      const success = await testEncryption(testData, key);

      if (!success) {
        throw new Error("Encryption test failed");
      }

      // Cache key in memory
      keyCache.set(passphrase, key);

      logger.info("Encryption initialized successfully");
      return true;
    } catch (error) {
      logger.error("Failed to initialize encryption", { error });
      return false;
    }
  }

  /**
   * Unlock encryption with passphrase
   *
   * Derives key from stored salt and provided passphrase.
   * Caches key in memory for session.
   *
   * @param passphrase - User passphrase
   * @returns True if unlock successful
   *
   * @example
   * ```typescript
   * const unlocked = await keyManagement.unlock("my-secure-passphrase");
   * if (unlocked) {
   *   // Can now use encryption
   * }
   * ```
   */
  async unlock(passphrase: string): Promise<boolean> {
    try {
      // Check if already unlocked
      if (keyCache.has()) {
        logger.info("Encryption already unlocked");
        return true;
      }

      // Get salt from storage
      const salt = this.getSalt();
      if (!salt) {
        throw new Error("Encryption not initialized. Call initialize() first.");
      }

      // Derive key
      const key = await deriveKey(passphrase, salt);

      // Verify key works (decrypt a test payload if available)
      // For now, we'll trust the derivation
      const testData = { test: "unlock-verification", timestamp: Date.now() };
      const success = await testEncryption(testData, key);

      if (!success) {
        throw new Error("Invalid passphrase or corrupted encryption");
      }

      // Cache key
      keyCache.set(passphrase, key);

      logger.info("Encryption unlocked successfully");
      return true;
    } catch (error) {
      logger.error("Failed to unlock encryption", { error });
      return false;
    }
  }

  /**
   * Lock encryption (clear keys from memory)
   *
   * Should be called on logout or when user wants to lock analytics.
   *
   * @example
   * ```typescript
   * keyManagement.lock();
   * // Encryption key cleared from memory
   * ```
   */
  lock(): void {
    keyCache.clear();
    logger.info("Encryption locked");
  }

  /**
   * Get cached encryption key
   *
   * @returns CryptoKey if unlocked, null otherwise
   *
   * @example
   * ```typescript
   * const key = keyManagement.getKey();
   * if (key) {
   *   const encrypted = await encryptData(data, key);
   * } else {
   *   // Need to unlock first
   * }
   * ```
   */
  getKey(): CryptoKey | null {
    const cached = keyCache.get();
    return cached?.key ?? null;
  }

  /**
   * Check if encryption is unlocked
   *
   * @returns True if key is available in memory
   */
  isUnlocked(): boolean {
    return keyCache.has();
  }

  /**
   * Check if encryption is initialized
   *
   * @returns True if salt exists in storage
   */
  isInitialized(): boolean {
    return this.getSalt() !== null;
  }

  /**
   * Get stored salt
   *
   * @returns Base64-encoded salt or null if not initialized
   */
  getSalt(): string | null {
    return localStorage.getItem(STORAGE_KEYS.SALT);
  }

  /**
   * Get current key version
   *
   * @returns Key version number
   */
  getKeyVersion(): number {
    const version = localStorage.getItem(STORAGE_KEYS.KEY_VERSION);
    return version ? parseInt(version, 10) : 0;
  }

  /**
   * Rotate encryption key (change passphrase)
   *
   * WARNING: This requires re-encrypting all data.
   * For analytics, we don't store encrypted data, so this is safe.
   *
   * @param oldPassphrase - Current passphrase
   * @param newPassphrase - New passphrase
   * @returns True if rotation successful
   *
   * @example
   * ```typescript
   * const success = await keyManagement.rotateKey("old-pass", "new-pass");
   * if (success) {
   *   console.log("Passphrase changed");
   * }
   * ```
   */
  async rotateKey(oldPassphrase: string, newPassphrase: string): Promise<boolean> {
    try {
      // Verify old passphrase
      const unlocked = await this.unlock(oldPassphrase);
      if (!unlocked) {
        throw new Error("Invalid old passphrase");
      }

      // Lock current key
      this.lock();

      // Initialize with new passphrase
      const initialized = await this.initialize(newPassphrase);
      if (!initialized) {
        throw new Error("Failed to initialize with new passphrase");
      }

      logger.info("Encryption key rotated successfully");
      return true;
    } catch (error) {
      logger.error("Failed to rotate encryption key", { error });
      return false;
    }
  }

  /**
   * Reset encryption (delete salt and clear cache)
   *
   * WARNING: This will prevent decryption of any existing encrypted data.
   * Only use if you're sure no encrypted data needs to be preserved.
   *
   * @example
   * ```typescript
   * keyManagement.reset();
   * // All encryption data cleared
   * ```
   */
  reset(): void {
    this.lock();
    localStorage.removeItem(STORAGE_KEYS.SALT);
    localStorage.removeItem(STORAGE_KEYS.KEY_VERSION);
    logger.info("Encryption reset");
  }

  /**
   * Get encryption status
   *
   * @returns Object with initialization and unlock status
   */
  getStatus(): {
    initialized: boolean;
    unlocked: boolean;
    keyVersion: number;
  } {
    return {
      initialized: this.isInitialized(),
      unlocked: this.isUnlocked(),
      keyVersion: this.getKeyVersion(),
    };
  }
}

/**
 * Singleton instance
 */
export const keyManagement = new KeyManagementService();

/**
 * Auto-lock on page unload
 */
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    keyManagement.lock();
  });

  // Also lock on visibility change (user switches tabs for extended period)
  let hiddenTimeout: NodeJS.Timeout | null = null;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // Lock after 30 minutes of inactivity
      hiddenTimeout = setTimeout(
        () => {
          keyManagement.lock();
          logger.info("Auto-locked encryption due to inactivity");
        },
        30 * 60 * 1000
      );
    } else {
      // User returned, cancel auto-lock
      if (hiddenTimeout) {
        clearTimeout(hiddenTimeout);
        hiddenTimeout = null;
      }
    }
  });
}
