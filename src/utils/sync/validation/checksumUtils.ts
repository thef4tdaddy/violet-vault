import logger from "../../common/logger";
import { VALIDATION_CONSTANTS } from "./constants";

/**
 * Checksum utilities for data integrity verification
 *
 * Addresses GitHub Issue #576 - Cloud Sync Reliability Improvements
 */

/**
 * Generate checksum for data integrity verification
 * @param {any} data - Data to checksum (will be JSON stringified if not string/ArrayBuffer)
 * @returns {Promise<string>} Checksum hash
 */
export const generateChecksum = async (data) => {
  try {
    const encoder = new TextEncoder();
    let dataBuffer;

    if (data instanceof ArrayBuffer) {
      dataBuffer = data;
    } else if (typeof data === "string") {
      dataBuffer = encoder.encode(data);
    } else {
      // Handle objects, arrays, null, undefined, etc.
      const jsonString = JSON.stringify(data, (_key, value) => {
        if (value === undefined) return null;
        if (typeof value === "function") return "[Function]";
        if (value instanceof Date) return value.toISOString();
        return value;
      });
      dataBuffer = encoder.encode(jsonString);
    }

    const hashBuffer = await crypto.subtle.digest(
      VALIDATION_CONSTANTS.CHECKSUM_ALGORITHM,
      dataBuffer
    );
    const hashArray = new Uint8Array(hashBuffer);
    const hashHex = Array.from(hashArray)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    logger.debug("🔍 Generated checksum", {
      dataSize: dataBuffer.byteLength,
      checksum: hashHex.substring(0, 8) + "...",
    });

    return hashHex;
  } catch (error) {
    logger.error("❌ Checksum generation failed", { error: error.message });
    return ""; // Return empty string on error instead of throwing
  }
};

/**
 * Validate data against expected checksum
 * @param {any} data - Data to validate
 * @param {string} expectedChecksum - Expected checksum
 * @returns {Promise<boolean>} True if checksums match
 */
export const validateChecksum = async (data, expectedChecksum) => {
  try {
    if (!expectedChecksum) {
      return false;
    }

    const actualChecksum = await generateChecksum(data);

    if (!actualChecksum) {
      return false;
    }

    const isValid = actualChecksum === expectedChecksum;

    if (isValid) {
      logger.debug("✅ Checksum validation passed");
    } else {
      logger.error("❌ Checksum validation failed", {
        expected: expectedChecksum.substring(0, 8) + "...",
        actual: actualChecksum.substring(0, 8) + "...",
      });
    }

    return isValid;
  } catch (error) {
    logger.error("❌ Checksum validation error", { error: error.message });
    return false;
  }
};

export default {
  generateChecksum,
  validateChecksum,
};
