import logger from "../../common/logger";
import { VALIDATION_CONSTANTS } from "./constants";

/**
 * Checksum utilities for data integrity verification
 *
 * Addresses GitHub Issue #576 - Cloud Sync Reliability Improvements
 */

/**
 * Generate checksum for data integrity verification
 * @param {string|ArrayBuffer} data - Data to checksum
 * @returns {Promise<string>} Checksum hash
 */
export const generateChecksum = async (data) => {
  try {
    const encoder = new TextEncoder();
    const dataBuffer = typeof data === "string" ? encoder.encode(data) : data;
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
    throw error;
  }
};

/**
 * Validate data against expected checksum
 * @param {string|ArrayBuffer} data - Data to validate
 * @param {string} expectedChecksum - Expected checksum
 * @returns {Promise<boolean>} True if checksums match
 */
export const validateChecksum = async (data, expectedChecksum) => {
  try {
    const actualChecksum = await generateChecksum(data);
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
