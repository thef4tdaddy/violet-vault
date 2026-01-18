import { describe, it, expect } from "vitest";
import {
  VALIDATION_CONSTANTS,
  generateChecksum,
  validateChecksum,
  validateEncryptedData,
  validateManifest,
  checksumUtils,
  encryptedDataValidator,
  manifestValidator,
} from "../index";

describe("validation index exports", () => {
  describe("direct exports", () => {
    it("should export VALIDATION_CONSTANTS", () => {
      expect(VALIDATION_CONSTANTS).toBeDefined();
      expect(typeof VALIDATION_CONSTANTS).toBe("object");
      expect(VALIDATION_CONSTANTS.MIN_ENCRYPTED_DATA_LENGTH).toBeDefined();
      expect(VALIDATION_CONSTANTS.MIN_IV_LENGTH).toBeDefined();
    });

    it("should export checksum functions", () => {
      expect(typeof generateChecksum).toBe("function");
      expect(typeof validateChecksum).toBe("function");
    });

    it("should export validation functions", () => {
      expect(typeof validateEncryptedData).toBe("function");
      expect(typeof validateManifest).toBe("function");
    });
  });

  describe("namespace exports", () => {
    it("should export checksumUtils namespace", () => {
      expect(checksumUtils).toBeDefined();
      expect(typeof checksumUtils.generateChecksum).toBe("function");
      expect(typeof checksumUtils.validateChecksum).toBe("function");
    });

    it("should export encryptedDataValidator namespace", () => {
      expect(encryptedDataValidator).toBeDefined();
      expect(typeof encryptedDataValidator.validateEncryptedData).toBe("function");
    });

    it("should export manifestValidator namespace", () => {
      expect(manifestValidator).toBeDefined();
      expect(typeof manifestValidator.validateManifest).toBe("function");
    });
  });

  describe("functional tests", () => {
    it("should work with exported checksum functions", async () => {
      const testData = { test: "data", number: 123 };
      const checksum = await generateChecksum(testData);
      const isValid = await validateChecksum(testData, checksum);

      expect(typeof checksum).toBe("string");
      expect(isValid).toBe(true);
    });

    it("should work with exported validation functions", () => {
      const validEncryptedData = {
        data: "a".repeat(VALIDATION_CONSTANTS.MIN_ENCRYPTED_DATA_LENGTH),
        iv: "b".repeat(VALIDATION_CONSTANTS.MIN_IV_LENGTH),
      };

      const validManifest = {
        version: "2.0",
        timestamp: Date.now(),
        chunks: {},
      };

      const encryptedResult = validateEncryptedData(validEncryptedData, "test");
      const manifestResult = validateManifest(validManifest, "test");

      expect(encryptedResult.isValid).toBe(true);
      expect(manifestResult.isValid).toBe(true);
    });

    it("should work with namespace exports", async () => {
      const testData = { namespace: "test" };

      // Test checksumUtils namespace
      const checksum = await checksumUtils.generateChecksum(testData);
      const isValid = await checksumUtils.validateChecksum(testData, checksum);
      expect(isValid).toBe(true);

      // Test encryptedDataValidator namespace
      const encryptedData = {
        data: "a".repeat(VALIDATION_CONSTANTS.MIN_ENCRYPTED_DATA_LENGTH),
        iv: "b".repeat(VALIDATION_CONSTANTS.MIN_IV_LENGTH),
      };
      const encryptedResult = encryptedDataValidator.validateEncryptedData(
        encryptedData,
        "namespace-test"
      );
      expect(encryptedResult.isValid).toBe(true);

      // Test manifestValidator namespace
      const manifest = {
        version: "2.0",
        timestamp: Date.now(),
        chunks: {},
      };
      const manifestResult = manifestValidator.validateManifest(manifest, "namespace-test");
      expect(manifestResult.isValid).toBe(true);
    });
  });

  describe("constants validation", () => {
    it("should have valid constant values", () => {
      expect(VALIDATION_CONSTANTS.MIN_ENCRYPTED_DATA_LENGTH).toBeGreaterThan(0);
      expect(VALIDATION_CONSTANTS.MIN_IV_LENGTH).toBeGreaterThan(0);
      expect(VALIDATION_CONSTANTS.MAX_MANIFEST_SIZE).toBeGreaterThan(
        VALIDATION_CONSTANTS.MIN_ENCRYPTED_DATA_LENGTH
      );
      expect(VALIDATION_CONSTANTS.LARGE_DATA_WARNING_SIZE).toBeGreaterThan(
        VALIDATION_CONSTANTS.MIN_ENCRYPTED_DATA_LENGTH
      );
      expect(VALIDATION_CONSTANTS.MAX_DATA_AGE_HOURS).toBeGreaterThan(0);
      expect(VALIDATION_CONSTANTS.CLOCK_SKEW_TOLERANCE).toBeGreaterThan(0);
    });

    it("should have consistent size relationships", () => {
      expect(VALIDATION_CONSTANTS.LARGE_DATA_WARNING_SIZE).toBeLessThan(
        VALIDATION_CONSTANTS.MAX_MANIFEST_SIZE
      );
      expect(VALIDATION_CONSTANTS.MIN_ENCRYPTED_DATA_LENGTH).toBeLessThan(
        VALIDATION_CONSTANTS.LARGE_DATA_WARNING_SIZE
      );
    });
  });
});
