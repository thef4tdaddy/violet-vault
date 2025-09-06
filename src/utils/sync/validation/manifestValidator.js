import logger from "../../common/logger";
import { VALIDATION_CONSTANTS } from "./constants";

/**
 * Validator for manifest structure and content
 * Ensures manifest integrity before processing
 *
 * Addresses GitHub Issue #576 - Cloud Sync Reliability Improvements
 */

/**
 * Validate manifest structure and content
 */
export const validateManifest = (manifest, operation = "unknown") => {
  const errors = [];
  const warnings = [];

  if (!manifest) {
    errors.push("Manifest is null or undefined");
    return { isValid: false, errors, warnings };
  }

  _validateRequiredProperties(manifest, errors);
  _validateVersion(manifest, errors);
  _validateTimestamp(manifest, warnings);
  _validateChunks(manifest, errors);

  return _buildValidationResult(manifest, errors, warnings, operation);
};

/**
 * Validate required manifest properties
 * @private
 */
const _validateRequiredProperties = (manifest, errors) => {
  const requiredProperties = ["version", "timestamp", "chunks"];
  for (const prop of requiredProperties) {
    if (!(prop in manifest)) {
      errors.push(`Missing required manifest property: ${prop}`);
    }
  }
};

/**
 * Validate version property
 * @private
 */
const _validateVersion = (manifest, errors) => {
  if (manifest.version && typeof manifest.version !== "string") {
    errors.push("Manifest version must be a string");
  }
};

/**
 * Validate timestamp and check for age issues
 * @private
 */
const _validateTimestamp = (manifest, warnings) => {
  if (!manifest.timestamp) return;

  if (typeof manifest.timestamp !== "number") {
    warnings.push("Manifest timestamp must be a number");
    return;
  }

  const now = Date.now();
  const maxAge = VALIDATION_CONSTANTS.MAX_DATA_AGE_HOURS * 60 * 60 * 1000;

  if (manifest.timestamp > now + VALIDATION_CONSTANTS.CLOCK_SKEW_TOLERANCE) {
    warnings.push("Manifest timestamp is in the future");
  } else if (now - manifest.timestamp > maxAge) {
    const hoursOld = Math.round((now - manifest.timestamp) / (60 * 60 * 1000));
    warnings.push(`Manifest is old: ${hoursOld} hours`);
  }
};

/**
 * Validate chunks structure
 * @private
 */
const _validateChunks = (manifest, errors) => {
  if (manifest.chunks && typeof manifest.chunks !== "object") {
    errors.push("Manifest chunks must be an object");
  }
};

/**
 * Build validation result with logging
 * @private
 */
const _buildValidationResult = (manifest, errors, warnings, operation) => {
  const result = {
    isValid: errors.length === 0,
    errors,
    warnings,
    chunkCount: manifest.chunks ? Object.keys(manifest.chunks).length : 0,
    manifestSize: JSON.stringify(manifest).length,
  };

  // Log validation results
  if (!result.isValid) {
    logger.error(`❌ Manifest validation failed for ${operation}`, result);
  } else if (warnings.length > 0) {
    logger.warn(`⚠️ Manifest validation warnings for ${operation}`, result);
  } else {
    logger.debug(`✅ Manifest validation passed for ${operation}`, {
      chunkCount: result.chunkCount,
      manifestSize: result.manifestSize,
    });
  }

  return result;
};

export default {
  validateManifest,
};
