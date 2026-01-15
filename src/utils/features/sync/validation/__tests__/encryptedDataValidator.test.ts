import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateEncryptedData } from "../encryptedDataValidator";
import { VALIDATION_CONSTANTS } from "../constants";

// Mock logger
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Type definition for valid validation result
type ValidResult = {
  isValid: true;
  errors: unknown[];
  warnings: unknown[];
  dataLength: number;
  ivLength: number;
};

describe("encryptedDataValidator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("basic validation", () => {
    it("should pass valid encrypted data", () => {
      const validData = {
        data: "a".repeat(VALIDATION_CONSTANTS.MIN_ENCRYPTED_DATA_LENGTH),
        iv: "b".repeat(VALIDATION_CONSTANTS.MIN_IV_LENGTH),
      };

      const result = validateEncryptedData(validData, "test-operation");

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect((result as ValidResult).dataLength).toBe(
        VALIDATION_CONSTANTS.MIN_ENCRYPTED_DATA_LENGTH
      );
      expect((result as ValidResult).ivLength).toBe(VALIDATION_CONSTANTS.MIN_IV_LENGTH);
    });

    it("should reject null/undefined data", () => {
      const nullResult = validateEncryptedData(null, "null-test");
      const undefinedResult = validateEncryptedData(undefined, "undefined-test");

      expect(nullResult.isValid).toBe(false);
      expect(nullResult.errors).toContain("Encrypted data object is null or undefined");

      expect(undefinedResult.isValid).toBe(false);
      expect(undefinedResult.errors).toContain("Encrypted data object is null or undefined");
    });

    it("should reject data missing properties", () => {
      const missingDataResult = validateEncryptedData({ iv: "test" }, "missing-data");
      const missingIvResult = validateEncryptedData({ data: "test" }, "missing-iv");
      const emptyObjectResult = validateEncryptedData({}, "empty");

      expect(missingDataResult.isValid).toBe(false);
      expect(missingDataResult.errors).toContain("Missing encrypted data property");

      expect(missingIvResult.isValid).toBe(false);
      expect(missingIvResult.errors).toContain("Missing initialization vector (IV) property");

      expect(emptyObjectResult.isValid).toBe(false);
      expect(emptyObjectResult.errors).toHaveLength(2);
    });
  });

  describe("size validation", () => {
    it("should reject data that is too small", () => {
      const tooSmallData = {
        data: "a".repeat(VALIDATION_CONSTANTS.MIN_ENCRYPTED_DATA_LENGTH - 1),
        iv: "b".repeat(VALIDATION_CONSTANTS.MIN_IV_LENGTH),
      };

      const result = validateEncryptedData(tooSmallData, "too-small-data");

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        `Encrypted data too small: ${VALIDATION_CONSTANTS.MIN_ENCRYPTED_DATA_LENGTH - 1} bytes (minimum: ${VALIDATION_CONSTANTS.MIN_ENCRYPTED_DATA_LENGTH})`
      );
    });

    it("should reject IV that is too small", () => {
      const tooSmallIv = {
        data: "a".repeat(VALIDATION_CONSTANTS.MIN_ENCRYPTED_DATA_LENGTH),
        iv: "b".repeat(VALIDATION_CONSTANTS.MIN_IV_LENGTH - 1),
      };

      const result = validateEncryptedData(tooSmallIv, "too-small-iv");

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        `IV too small: ${VALIDATION_CONSTANTS.MIN_IV_LENGTH - 1} bytes (minimum: ${VALIDATION_CONSTANTS.MIN_IV_LENGTH})`
      );
    });

    it("should reject data that is too large", () => {
      const tooLargeData = {
        data: "a".repeat(VALIDATION_CONSTANTS.MAX_MANIFEST_SIZE + 1),
        iv: "b".repeat(VALIDATION_CONSTANTS.MIN_IV_LENGTH),
      };

      const result = validateEncryptedData(tooLargeData, "too-large");

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        `Encrypted data too large: ${VALIDATION_CONSTANTS.MAX_MANIFEST_SIZE + 1} bytes (maximum: ${VALIDATION_CONSTANTS.MAX_MANIFEST_SIZE})`
      );
    });

    it("should warn about large data", () => {
      const largeData = {
        data: "a".repeat(VALIDATION_CONSTANTS.LARGE_DATA_WARNING_SIZE + 1),
        iv: "b".repeat(VALIDATION_CONSTANTS.MIN_IV_LENGTH),
      };

      const result = validateEncryptedData(largeData, "large-warning");

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(
        `Large encrypted data: ${VALIDATION_CONSTANTS.LARGE_DATA_WARNING_SIZE + 1} bytes`
      );
    });
  });

  describe("edge cases", () => {
    it("should handle validation errors gracefully", () => {
      const invalidData = {
        get data() {
          throw new Error("Property access error");
        },
        iv: "valid-iv",
      };

      const result = validateEncryptedData(invalidData, "error-test");

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Data validation error: Property access error");
    });

    it("should default operation name", () => {
      const validData = {
        data: "a".repeat(VALIDATION_CONSTANTS.MIN_ENCRYPTED_DATA_LENGTH),
        iv: "b".repeat(VALIDATION_CONSTANTS.MIN_IV_LENGTH),
      };

      const result = validateEncryptedData(validData);
      expect(result.isValid).toBe(true);
    });

    it("should handle exactly minimum sizes", () => {
      const exactMinimumData = {
        data: "a".repeat(VALIDATION_CONSTANTS.MIN_ENCRYPTED_DATA_LENGTH),
        iv: "b".repeat(VALIDATION_CONSTANTS.MIN_IV_LENGTH),
      };

      const result = validateEncryptedData(exactMinimumData, "exact-minimum");

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect((result as ValidResult).dataLength).toBe(
        VALIDATION_CONSTANTS.MIN_ENCRYPTED_DATA_LENGTH
      );
      expect((result as ValidResult).ivLength).toBe(VALIDATION_CONSTANTS.MIN_IV_LENGTH);
    });

    it("should handle exactly maximum sizes", () => {
      const exactMaximumData = {
        data: "a".repeat(VALIDATION_CONSTANTS.MAX_MANIFEST_SIZE),
        iv: "b".repeat(VALIDATION_CONSTANTS.MIN_IV_LENGTH),
      };

      const result = validateEncryptedData(exactMaximumData, "exact-maximum");

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("logging integration", () => {
    it("should log validation failures", async () => {
      const logger = await import("@/utils/core/common/logger");

      const invalidData = {
        data: "too-short",
        iv: "short",
      };

      validateEncryptedData(invalidData, "logging-test");

      expect(logger.default.error).toHaveBeenCalledWith(
        "❌ Data validation failed for logging-test",
        expect.objectContaining({
          isValid: false,
          errors: expect.any(Array),
          warnings: expect.any(Array),
        })
      );
    });

    it("should log validation warnings", async () => {
      const logger = await import("@/utils/core/common/logger");

      const largeData = {
        data: "a".repeat(VALIDATION_CONSTANTS.LARGE_DATA_WARNING_SIZE + 1),
        iv: "b".repeat(VALIDATION_CONSTANTS.MIN_IV_LENGTH),
      };

      validateEncryptedData(largeData, "warning-test");

      expect(logger.default.warn).toHaveBeenCalledWith(
        "⚠️ Data validation warnings for warning-test",
        expect.objectContaining({
          isValid: true,
          warnings: expect.arrayContaining([expect.stringContaining("Large encrypted data")]),
        })
      );
    });

    it("should log successful validation", async () => {
      const logger = await import("@/utils/core/common/logger");

      const validData = {
        data: "a".repeat(VALIDATION_CONSTANTS.MIN_ENCRYPTED_DATA_LENGTH),
        iv: "b".repeat(VALIDATION_CONSTANTS.MIN_IV_LENGTH),
      };

      validateEncryptedData(validData, "success-test");

      expect(logger.default.debug).toHaveBeenCalledWith(
        "✅ Data validation passed for success-test",
        expect.objectContaining({
          dataLength: VALIDATION_CONSTANTS.MIN_ENCRYPTED_DATA_LENGTH,
          ivLength: VALIDATION_CONSTANTS.MIN_IV_LENGTH,
        })
      );
    });
  });
});
