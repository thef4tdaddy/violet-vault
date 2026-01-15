import logger from "@/utils/core/common/logger";
import { VALIDATION_CONSTANTS } from "./constants";

/**
 * Checksum utilities for data integrity verification
 *
 * Addresses GitHub Issue #576 - Cloud Sync Reliability Improvements
 */

/**
 * Generate checksum for data integrity verification
 * @param data - Data to checksum (will be JSON stringified if not string/ArrayBuffer)
 * @returns Checksum hash
 */
export const generateChecksum = async (data: unknown): Promise<string> => {
  try {
    const encoder = new TextEncoder();
    let dataBuffer: ArrayBuffer;

    if (data instanceof ArrayBuffer) {
      dataBuffer = data;
    } else if (typeof data === "string") {
      dataBuffer = encoder.encode(data).buffer;
    } else {
      // Handle objects, arrays, null, undefined, etc.
      const jsonString = JSON.stringify(data, (_key, value: unknown) => {
        if (value === undefined) return null;
        if (typeof value === "function") return "[Function]";
        if (value instanceof Date) return value.toISOString();
        return value;
      });
      dataBuffer = encoder.encode(jsonString).buffer;
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("❌ Checksum generation failed", { error: errorMessage });
    return ""; // Return empty string on error instead of throwing
  }
};

/**
 * Validate data against expected checksum
 * @param data - Data to validate
 * @param expectedChecksum - Expected checksum
 * @returns True if checksums match
 */
export const validateChecksum = async (
  data: unknown,
  expectedChecksum: string
): Promise<boolean> => {
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("❌ Checksum validation error", { error: errorMessage });
    return false;
  }
};

export default {
  generateChecksum,
  validateChecksum,
};
