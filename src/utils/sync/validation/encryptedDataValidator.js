import logger from "../../common/logger";
import { VALIDATION_CONSTANTS } from "./constants";

/**
 * Validator for encrypted data before decryption attempts
 * Prevents "The provided data is too small" errors
 *
 * Addresses GitHub Issue #576 - Cloud Sync Reliability Improvements
 */

/**
 * Validate encrypted data structure before decryption
 */
export const validateEncryptedData = (encryptedData, operation = "unknown") => {
  const errors = [];
  const warnings = [];

  // Check if encrypted data exists
  if (!encryptedData) {
    errors.push("Encrypted data object is null or undefined");
    return { isValid: false, errors, warnings };
  }

  // Check for required properties
  if (!encryptedData.data) {
    errors.push("Missing encrypted data property");
  }

  if (!encryptedData.iv) {
    errors.push("Missing initialization vector (IV) property");
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
const _validateDataSizes = (encryptedData, operation, errors, warnings) => {
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
    errors.push(`Data validation error: ${validationError.message}`);
    return { isValid: false, errors, warnings };
  }
};

/**
 * Build validation result object
 * @private
 */
const _buildValidationResult = (encryptedData, errors, warnings, operation) => {
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
