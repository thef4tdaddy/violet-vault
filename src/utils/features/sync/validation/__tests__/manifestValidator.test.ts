import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateManifest } from "../manifestValidator";
import { VALIDATION_CONSTANTS } from "../constants";

vi.mock("../../../../core/common/logger", () => {
  const mock = {
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    auth: vi.fn(),
    info: vi.fn(),
  };
  return {
    default: mock,
    logger: mock,
  };
});

import { logger } from "../../../../core/common/logger";

// Type definition for valid validation result
type ValidResult = {
  isValid: true;
  errors: unknown[];
  warnings: unknown[];
  chunkCount: number;
  manifestSize: number;
};

describe("manifestValidator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("basic validation", () => {
    it("should pass valid manifest", () => {
      const validManifest = {
        version: "2.0",
        timestamp: Date.now(),
        chunks: {
          chunk1: { size: 1000, itemCount: 10 },
          chunk2: { size: 2000, itemCount: 20 },
        },
      };

      const result = validateManifest(validManifest, "test-operation");

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      if (result.isValid) {
        expect((result as ValidResult).chunkCount).toBe(2);
        expect((result as ValidResult).manifestSize).toBeGreaterThan(0);
      }
    });

    it("should reject null/undefined manifest", () => {
      const nullResult = validateManifest(null, "null-test");
      const undefinedResult = validateManifest(undefined, "undefined-test");

      expect(nullResult.isValid).toBe(false);
      expect(nullResult.errors).toContain("Manifest is null or undefined");

      expect(undefinedResult.isValid).toBe(false);
      expect(undefinedResult.errors).toContain("Manifest is null or undefined");
    });

    it("should reject manifest missing required properties", () => {
      const missingVersionResult = validateManifest(
        {
          timestamp: Date.now(),
          chunks: {},
        },
        "missing-version"
      );

      const missingTimestampResult = validateManifest(
        {
          version: "2.0",
          chunks: {},
        },
        "missing-timestamp"
      );

      const missingChunksResult = validateManifest(
        {
          version: "2.0",
          timestamp: Date.now(),
        },
        "missing-chunks"
      );

      expect(missingVersionResult.isValid).toBe(false);
      expect(missingVersionResult.errors).toContain("Missing required manifest property: version");

      expect(missingTimestampResult.isValid).toBe(false);
      expect(missingTimestampResult.errors).toContain(
        "Missing required manifest property: timestamp"
      );

      expect(missingChunksResult.isValid).toBe(false);
      expect(missingChunksResult.errors).toContain("Missing required manifest property: chunks");
    });
  });

  describe("version validation", () => {
    it("should reject non-string version", () => {
      const manifest = {
        version: 2.0, // Should be string
        timestamp: Date.now(),
        chunks: {},
      };

      const result = validateManifest(manifest as any, "version-type-test");

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Manifest version must be a string");
    });

    it("should accept string version", () => {
      const manifest = {
        version: "2.0",
        timestamp: Date.now(),
        chunks: {},
      };

      const result = validateManifest(manifest, "valid-version");

      expect(result.isValid).toBe(true);
    });

    it("should handle missing version gracefully", () => {
      const manifest = {
        timestamp: Date.now(),
        chunks: {},
      };

      const result = validateManifest(manifest, "no-version");

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing required manifest property: version");
    });
  });

  describe("timestamp validation", () => {
    it("should warn about non-number timestamp", () => {
      const manifest = {
        version: "2.0",
        timestamp: "2023-01-01", // Should be number
        chunks: {},
      };

      const result = validateManifest(manifest as any, "timestamp-type-test");

      expect(result.isValid).toBe(true); // Warnings don't fail validation
      expect(result.warnings).toContain("Manifest timestamp must be a number");
    });

    it("should warn about future timestamp", () => {
      const futureTime = Date.now() + VALIDATION_CONSTANTS.CLOCK_SKEW_TOLERANCE + 1000;
      const manifest = {
        version: "2.0",
        timestamp: futureTime,
        chunks: {},
      };

      const result = validateManifest(manifest, "future-timestamp");

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain("Manifest timestamp is in the future");
    });

    it("should warn about old timestamp", () => {
      const maxAge = VALIDATION_CONSTANTS.MAX_DATA_AGE_HOURS * 60 * 60 * 1000;
      const oldTime = Date.now() - maxAge - 1000;
      const manifest = {
        version: "2.0",
        timestamp: oldTime,
        chunks: {},
      };

      const result = validateManifest(manifest, "old-timestamp");

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContainEqual(expect.stringContaining("Manifest is old:"));
    });

    it("should accept recent valid timestamp", () => {
      const manifest = {
        version: "2.0",
        timestamp: Date.now() - 1000, // 1 second ago
        chunks: {},
      };

      const result = validateManifest(manifest, "valid-timestamp");

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it("should handle missing timestamp gracefully", () => {
      const manifest = {
        version: "2.0",
        chunks: {},
      };

      const result = validateManifest(manifest, "no-timestamp");

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing required manifest property: timestamp");
    });
  });

  describe("chunks validation", () => {
    it("should reject non-object chunks", () => {
      const manifest = {
        version: "2.0",
        timestamp: Date.now(),
        chunks: "not-an-object",
      };

      const result = validateManifest(manifest as any, "chunks-type-test");

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Manifest chunks must be an object");
    });

    it("should accept empty chunks object", () => {
      const manifest = {
        version: "2.0",
        timestamp: Date.now(),
        chunks: {},
      };

      const result = validateManifest(manifest, "empty-chunks");

      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect((result as ValidResult).chunkCount).toBe(0);
      }
    });

    it("should count chunks correctly", () => {
      const manifest = {
        version: "2.0",
        timestamp: Date.now(),
        chunks: {
          chunk1: { size: 100 },
          chunk2: { size: 200 },
          chunk3: { size: 300 },
        },
      };

      const result = validateManifest(manifest, "chunk-count");

      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect((result as ValidResult).chunkCount).toBe(3);
      }
    });
  });

  describe("edge cases", () => {
    it("should default operation name", () => {
      const validManifest = {
        version: "2.0",
        timestamp: Date.now(),
        chunks: {},
      };

      const result = validateManifest(validManifest);

      expect(result.isValid).toBe(true);
    });

    it("should calculate manifest size", () => {
      const manifest = {
        version: "2.0",
        timestamp: Date.now(),
        chunks: {
          test: { size: 100, data: "test-data" },
        },
      };

      const result = validateManifest(manifest, "size-test");

      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect((result as ValidResult).manifestSize).toBeGreaterThan(0);
        expect(typeof (result as ValidResult).manifestSize).toBe("number");
      }
    });

    it("should handle complex nested chunks", () => {
      const manifest = {
        version: "2.0",
        timestamp: Date.now(),
        chunks: {
          transactions_chunk_001: {
            size: 15000,
            itemCount: 100,
            type: "array",
            metadata: { compressed: true },
          },
          envelopes_chunk_001: {
            size: 8000,
            itemCount: 50,
            type: "array",
            metadata: { compressed: false },
          },
        },
      };

      const result = validateManifest(manifest, "complex-chunks");

      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect((result as ValidResult).chunkCount).toBe(2);
      }
    });
  });

  describe("clock skew tolerance", () => {
    it("should accept timestamp within clock skew tolerance", () => {
      const futureTime = Date.now() + VALIDATION_CONSTANTS.CLOCK_SKEW_TOLERANCE - 1000;
      const manifest = {
        version: "2.0",
        timestamp: futureTime,
        chunks: {},
      };

      const result = validateManifest(manifest, "clock-skew-ok");

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it("should warn about timestamp beyond clock skew tolerance", () => {
      const futureTime = Date.now() + VALIDATION_CONSTANTS.CLOCK_SKEW_TOLERANCE + 1000;
      const manifest = {
        version: "2.0",
        timestamp: futureTime,
        chunks: {},
      };

      const result = validateManifest(manifest, "clock-skew-exceeded");

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain("Manifest timestamp is in the future");
    });
  });

  describe("logging integration", () => {
    it("should log validation failures", async () => {
      const invalidManifest = {
        version: 123, // Wrong type
        chunks: "not-object", // Wrong type
      };

      validateManifest(invalidManifest as any, "logging-failure-test");

      expect(logger.error).toHaveBeenCalledWith(
        "❌ Manifest validation failed for logging-failure-test",
        null,
        expect.objectContaining({
          validationResult: expect.objectContaining({
            isValid: false,
            errors: expect.any(Array),
          }),
        })
      );
    });

    it("should log validation warnings", async () => {
      const futureTime = Date.now() + VALIDATION_CONSTANTS.CLOCK_SKEW_TOLERANCE + 1000;
      const manifest = {
        version: "2.0",
        timestamp: futureTime,
        chunks: {},
      };

      validateManifest(manifest, "logging-warning-test");

      expect(logger.warn).toHaveBeenCalledWith(
        "⚠️ Manifest validation warnings for logging-warning-test",
        {
          validationResult: expect.objectContaining({
            isValid: true,
            warnings: expect.arrayContaining(["Manifest timestamp is in the future"]),
          }),
        }
      );
    });

    it("should log successful validation", async () => {
      const validManifest = {
        version: "2.0",
        timestamp: Date.now(),
        chunks: {
          test: { size: 100 },
        },
      };

      validateManifest(validManifest, "logging-success-test");

      expect(logger.debug).toHaveBeenCalledWith(
        "✅ Manifest validation passed for logging-success-test",
        expect.objectContaining({
          chunkCount: expect.any(Number),
          manifestSize: expect.any(Number),
        })
      );
    });
  });
});
