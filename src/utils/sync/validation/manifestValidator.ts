import logger from "../../common/logger";
import { VALIDATION_CONSTANTS } from "./constants";

// Define types for manifest validation
interface Manifest {
  version?: string;
  timestamp?: number;
  chunks?: Record<string, unknown>;
  [key: string]: unknown;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  chunkCount: number;
  manifestSize: number;
}

/**
 * Validator for manifest structure and content
 * Ensures manifest integrity before processing
 *
 * Addresses GitHub Issue #576 - Cloud Sync Reliability Improvements
 */

/**
 * Validate manifest structure and content
 */
export const validateManifest = (manifest: unknown, operation = "unknown"): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!manifest) {
    errors.push("Manifest is null or undefined");
    return { isValid: false, errors, warnings, chunkCount: 0, manifestSize: 0 };
  }

  // Type guard to ensure manifest is an object
  if (typeof manifest !== "object" || manifest === null) {
    errors.push("Manifest must be an object");
    return { isValid: false, errors, warnings, chunkCount: 0, manifestSize: 0 };
  }

  const manifestObj = manifest as Manifest;

  _validateRequiredProperties(manifestObj, errors);
  _validateVersion(manifestObj, errors);
  _validateTimestamp(manifestObj, warnings);
  _validateChunks(manifestObj, errors);

  const result = _buildValidationResult(manifestObj, errors, warnings, operation);

  // Log validation results
  if (!result.isValid) {
    logger.error(`❌ Manifest validation failed for ${operation}`, result as unknown as Record<string, unknown>);
  } else if (warnings.length > 0) {
    logger.warn(`⚠️ Manifest validation warnings for ${operation}`, result as unknown as Record<string, unknown>);
  } else {
    logger.debug(`✅ Manifest validation passed for ${operation}`, {
      chunkCount: result.chunkCount,
      manifestSize: result.manifestSize,
    });
  }

  return result;
};

/**
 * Validate required manifest properties
 * @private
 */
const _validateRequiredProperties = (manifest: Manifest, errors: string[]): void => {
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
const _validateVersion = (manifest: Manifest, errors: string[]): void => {
  if (manifest.version && typeof manifest.version !== "string") {
    errors.push("Manifest version must be a string");
  }
};

/**
 * Validate timestamp and check for age issues
 * @private
 */
const _validateTimestamp = (manifest: Manifest, warnings: string[]): void => {
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
const _validateChunks = (manifest: Manifest, errors: string[]): void => {
  if (manifest.chunks && typeof manifest.chunks !== "object") {
    errors.push("Manifest chunks must be an object");
  }
};

/**
 * Build validation result with logging
 * @private
 */
const _buildValidationResult = (
  manifest: Manifest,
  errors: string[],
  warnings: string[],
  operation: string
): ValidationResult => {
  const result: ValidationResult = {
    isValid: errors.length === 0,
    errors,
    warnings,
    chunkCount: manifest.chunks ? Object.keys(manifest.chunks).length : 0,
    manifestSize: JSON.stringify(manifest).length,
  };

  return result;
};

export default {
  validateManifest,
};
