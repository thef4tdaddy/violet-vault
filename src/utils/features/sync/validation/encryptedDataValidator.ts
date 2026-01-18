import logger from "@/utils/core/common/logger";
import { VALIDATION_CONSTANTS } from "./constants";

/**
 * Validator for encrypted data before decryption attempts
 * Prevents "The provided data is too small" errors
 *
 * Addresses GitHub Issue #576 - Cloud Sync Reliability Improvements
 */

interface EncryptedData {
  data: string;
  iv: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate encrypted data structure before decryption
 */
export const validateEncryptedData = (
  encryptedData: EncryptedData | null | undefined,
  operation = "unknown"
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if encrypted data exists
  if (!encryptedData) {
    errors.push("Encrypted data object is null or undefined");
    return { isValid: false, errors, warnings };
  }

  // Check for required properties with error handling
  try {
    if (!encryptedData.data) {
      errors.push("Missing encrypted data property");
    }

    if (!encryptedData.iv) {
      errors.push("Missing initialization vector (IV) property");
    }
  } catch (accessError) {
    const errorMsg = accessError instanceof Error ? accessError.message : String(accessError);
    errors.push(`Data validation error: ${errorMsg}`);
    return { isValid: false, errors, warnings };
  }

  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  return _validateDataSizes(encryptedData, operation, errors, warnings);
};

/**
 * Validate data sizes to prevent corruption errors
 * @private
 */
const _validateDataSizes = (
  encryptedData: EncryptedData,
  operation: string,
  errors: string[],
  warnings: string[]
): ValidationResult => {
  try {
    const dataLength = encryptedData.data.length;
    const ivLength = encryptedData.iv.length;

    // Check minimum sizes (prevents "data too small" errors)
    if (dataLength < VALIDATION_CONSTANTS.MIN_ENCRYPTED_DATA_LENGTH) {
      errors.push(
        `Encrypted data too small: ${dataLength} bytes (minimum: ${VALIDATION_CONSTANTS.MIN_ENCRYPTED_DATA_LENGTH})`
      );
    }

    if (ivLength < VALIDATION_CONSTANTS.MIN_IV_LENGTH) {
      errors.push(
        `IV too small: ${ivLength} bytes (minimum: ${VALIDATION_CONSTANTS.MIN_IV_LENGTH})`
      );
    }

    // Check maximum sizes (prevent memory exhaustion)
    if (dataLength > VALIDATION_CONSTANTS.MAX_MANIFEST_SIZE) {
      errors.push(
        `Encrypted data too large: ${dataLength} bytes (maximum: ${VALIDATION_CONSTANTS.MAX_MANIFEST_SIZE})`
      );
    }

    // Warning for unusual sizes
    if (dataLength > VALIDATION_CONSTANTS.LARGE_DATA_WARNING_SIZE) {
      warnings.push(`Large encrypted data: ${dataLength} bytes`);
    }

    return _buildValidationResult(encryptedData, errors, warnings, operation);
  } catch (validationError) {
    const errorMsg =
      validationError instanceof Error ? validationError.message : String(validationError);
    errors.push(`Data validation error: ${errorMsg}`);
    return { isValid: false, errors, warnings };
  }
};

/**
 * Build validation result object
 * @private
 */
const _buildValidationResult = (
  encryptedData: EncryptedData,
  errors: string[],
  warnings: string[],
  operation: string
): ValidationResult & { dataLength: number; ivLength: number } => {
  const result = {
    isValid: errors.length === 0,
    errors,
    warnings,
    dataLength: encryptedData.data?.length || 0,
    ivLength: encryptedData.iv?.length || 0,
  };

  // Log validation results
  if (!result.isValid) {
    logger.error(`❌ Data validation failed for ${operation}`, result);
  } else if (warnings.length > 0) {
    logger.warn(`⚠️ Data validation warnings for ${operation}`, result);
  } else {
    logger.debug(`✅ Data validation passed for ${operation}`, {
      dataLength: result.dataLength,
      ivLength: result.ivLength,
    });
  }

  return result;
};

export default {
  validateEncryptedData,
};
