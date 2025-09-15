/**
 * Validation constants for cloud sync operations
 * Centralized constants for data validation rules
 *
 * Addresses GitHub Issue #576 - Cloud Sync Reliability Improvements
 */

export const VALIDATION_CONSTANTS = {
  MIN_MANIFEST_SIZE: 100, // Minimum manifest size in bytes
  MIN_IV_LENGTH: 12, // Minimum IV length in bytes
  MIN_ENCRYPTED_DATA_LENGTH: 16, // Minimum encrypted data length in bytes
  MAX_MANIFEST_SIZE: 1024 * 1024, // Maximum manifest size (1MB)
  CHECKSUM_ALGORITHM: "SHA-256", // Algorithm for checksum validation
  MAX_DATA_AGE_HOURS: 24, // Maximum manifest age in hours
  CLOCK_SKEW_TOLERANCE: 60000, // 1 minute clock skew tolerance
  LARGE_DATA_WARNING_SIZE: 100000, // 100KB warning threshold
};

export default VALIDATION_CONSTANTS;
