/**
 * Crypto Compatibility Layer
 * Provides fallbacks and error handling for Web Crypto API
 *
 * Part of Issue #621 - Crypto runtime error fixes
 * Related to Epic #158 - Mobile UI/UX Enhancements
 */

import logger from "../common/logger";

/**
 * Check if Web Crypto API is available
 * @returns {boolean} Whether crypto.subtle is available
 */
export const isCryptoSupported = () => {
  try {
    return !!(
      typeof crypto !== "undefined" &&
      crypto.subtle &&
      typeof crypto.subtle.encrypt === "function"
    );
  } catch (error) {
    logger.warn("Crypto availability check failed:", { error });
    return false;
  }
};

/**
 * Get crypto instance with fallback handling
 * @returns {Object} Crypto object or null if not available
 */
export const getCrypto = () => {
  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      return crypto;
    }

    // Fallback for environments where crypto is not available
    if (typeof globalThis !== "undefined" && globalThis.crypto) {
      return globalThis.crypto;
    }

    if (typeof window !== "undefined" && window.crypto) {
      return window.crypto;
    }

    logger.warn("Web Crypto API not available in this environment");
    return null;
  } catch (error) {
    logger.error("Failed to access crypto:", error);
    return null;
  }
};

/**
 * Safe wrapper for crypto.subtle operations
 * @param {string} operation - The crypto operation name
 * @param {...any} args - Arguments to pass to the operation
 * @returns {Promise<any>} Result of crypto operation or null if failed
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const safeCryptoOperation = async (operation: string, ...args: any[]): Promise<any> => {
  try {
    const cryptoInstance = getCrypto();
    if (!cryptoInstance || !cryptoInstance.subtle) {
      throw new Error("Web Crypto API not available");
    }

    const subtleCrypto = cryptoInstance.subtle;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (subtleCrypto as any)[operation] !== "function") {
      throw new Error(`Crypto operation '${operation}' not supported`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (subtleCrypto as any)[operation](...args);
  } catch (error) {
    logger.error(`Crypto operation '${operation}' failed:`, error);
    throw error;
  }
};

/**
 * Generate random bytes using crypto API
 * @param {number} length - Number of bytes to generate
 * @returns {Uint8Array} Random bytes or fallback values
 */
export const getRandomBytes = (length: number): Uint8Array => {
  try {
    const cryptoInstance = getCrypto();
    if (cryptoInstance && cryptoInstance.getRandomValues) {
      const array = new Uint8Array(length);
      cryptoInstance.getRandomValues(array);
      return array;
    }

    // Fallback to Math.random (less secure but functional)
    logger.warn("Using fallback random generation - less secure");
    const array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  } catch (error) {
    logger.error("Random bytes generation failed:", error);
    // Last resort fallback
    const array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }
};

/**
 * Check if current environment is secure (HTTPS or localhost)
 * Web Crypto API requires secure context
 * @returns {boolean} Whether environment is secure
 */
export const isSecureContext = () => {
  try {
    if (typeof window !== "undefined") {
      return (
        window.isSecureContext ||
        window.location.protocol === "https:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      );
    }
    return true; // Assume secure in non-browser environments
  } catch (error) {
    logger.warn("Secure context check failed:", { error });
    return false;
  }
};

/**
 * Initialize crypto compatibility layer
 * Call this early in app initialization
 */
export const initializeCrypto = () => {
  const isSupported = isCryptoSupported();
  const isSecure = isSecureContext();

  if (!isSecure) {
    logger.warn("Crypto operations may be limited in non-secure context");
  }

  if (!isSupported) {
    logger.warn("Web Crypto API not fully supported - some features may be limited");
  }

  logger.info("Crypto compatibility layer initialized", {
    supported: isSupported,
    secure: isSecure,
  });

  return { supported: isSupported, secure: isSecure };
};

export default {
  isCryptoSupported,
  getCrypto,
  safeCryptoOperation,
  getRandomBytes,
  isSecureContext,
  initializeCrypto,
};
