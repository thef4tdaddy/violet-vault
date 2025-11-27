/**
 * Sync Schema Tests
 * Tests for sync validation schemas
 * Part of Issue #1341: Replace Manual Type Guards with Zod Schemas
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  CloudSyncUserSchema,
  ChunkedSyncStatsSchema,
  LoadedDataSchema,
  validateCloudSyncUser,
  validateCloudSyncUserSafe,
  validateChunkedSyncStats,
  validateChunkedSyncStatsSafe,
  validateLoadedData,
  validateLoadedDataSafe,
  formatSyncValidationErrors,
} from "../sync";
import { z } from "zod";

// Mock logger to avoid side effects in tests
vi.mock("@/utils/common/logger", () => ({
  default: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("Sync Schema Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("CloudSyncUserSchema", () => {
    it("should validate a valid cloud sync user", () => {
      const validUser = {
        uid: "user-123",
        userName: "testuser",
      };

      const result = CloudSyncUserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.uid).toBe("user-123");
        expect(result.data.userName).toBe("testuser");
      }
    });

    it("should reject user with empty uid", () => {
      const invalidUser = {
        uid: "",
        userName: "testuser",
      };

      const result = CloudSyncUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("should reject user with empty userName", () => {
      const invalidUser = {
        uid: "user-123",
        userName: "",
      };

      const result = CloudSyncUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("should reject user missing uid", () => {
      const invalidUser = {
        userName: "testuser",
      };

      const result = CloudSyncUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("should reject user missing userName", () => {
      const invalidUser = {
        uid: "user-123",
      };

      const result = CloudSyncUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("should reject null user", () => {
      const result = CloudSyncUserSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it("should reject undefined user", () => {
      const result = CloudSyncUserSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });
  });

  describe("ChunkedSyncStatsSchema", () => {
    it("should validate valid chunked sync stats", () => {
      const validStats = {
        maxChunkSize: 900000,
        maxArrayChunkSize: 5000,
        isInitialized: true,
      };

      const result = ChunkedSyncStatsSchema.safeParse(validStats);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.maxChunkSize).toBe(900000);
        expect(result.data.maxArrayChunkSize).toBe(5000);
        expect(result.data.isInitialized).toBe(true);
      }
    });

    it("should validate stats with optional fields", () => {
      const validStats = {
        maxChunkSize: 900000,
        maxArrayChunkSize: 5000,
        isInitialized: true,
        lastSyncTimestamp: Date.now(),
        totalChunks: 10,
        failedChunks: 0,
      };

      const result = ChunkedSyncStatsSchema.safeParse(validStats);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.lastSyncTimestamp).toBeDefined();
        expect(result.data.totalChunks).toBe(10);
        expect(result.data.failedChunks).toBe(0);
      }
    });

    it("should reject stats with negative maxChunkSize", () => {
      const invalidStats = {
        maxChunkSize: -1,
        maxArrayChunkSize: 5000,
        isInitialized: true,
      };

      const result = ChunkedSyncStatsSchema.safeParse(invalidStats);
      expect(result.success).toBe(false);
    });

    it("should reject stats with zero maxChunkSize", () => {
      const invalidStats = {
        maxChunkSize: 0,
        maxArrayChunkSize: 5000,
        isInitialized: true,
      };

      const result = ChunkedSyncStatsSchema.safeParse(invalidStats);
      expect(result.success).toBe(false);
    });

    it("should reject stats missing required fields", () => {
      const invalidStats = {
        maxChunkSize: 900000,
        // missing maxArrayChunkSize and isInitialized
      };

      const result = ChunkedSyncStatsSchema.safeParse(invalidStats);
      expect(result.success).toBe(false);
    });

    it("should reject stats with non-boolean isInitialized", () => {
      const invalidStats = {
        maxChunkSize: 900000,
        maxArrayChunkSize: 5000,
        isInitialized: "yes", // should be boolean
      };

      const result = ChunkedSyncStatsSchema.safeParse(invalidStats);
      expect(result.success).toBe(false);
    });
  });

  describe("LoadedDataSchema", () => {
    it("should validate null data", () => {
      const result = LoadedDataSchema.safeParse(null);
      expect(result.success).toBe(true);
    });

    it("should validate string data", () => {
      const result = LoadedDataSchema.safeParse("test string");
      expect(result.success).toBe(true);
    });

    it("should validate number data", () => {
      const result = LoadedDataSchema.safeParse(42);
      expect(result.success).toBe(true);
    });

    it("should validate boolean data", () => {
      const result = LoadedDataSchema.safeParse(true);
      expect(result.success).toBe(true);
    });

    it("should validate array data", () => {
      const result = LoadedDataSchema.safeParse([1, 2, 3]);
      expect(result.success).toBe(true);
    });

    it("should validate object with transactions array", () => {
      const data = {
        transactions: [{ id: "tx-1", amount: 100 }],
        envelopes: [{ id: "env-1", name: "Groceries" }],
      };

      const result = LoadedDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate object with null transactions", () => {
      const data = {
        transactions: null,
        envelopes: null,
      };

      const result = LoadedDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate object with additional properties", () => {
      const data = {
        transactions: [],
        envelopes: [],
        extraField: "extra value",
        anotherField: 123,
      };

      const result = LoadedDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject object with non-array transactions", () => {
      const data = {
        transactions: "not an array",
        envelopes: [],
      };

      const result = LoadedDataSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject object with non-array envelopes", () => {
      const data = {
        transactions: [],
        envelopes: { id: "env-1" }, // should be array
      };

      const result = LoadedDataSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject undefined data", () => {
      const result = LoadedDataSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });
  });

  describe("validateCloudSyncUser", () => {
    it("should return validated user for valid input", () => {
      const validUser = {
        uid: "user-123",
        userName: "testuser",
      };

      const result = validateCloudSyncUser(validUser);
      expect(result.uid).toBe("user-123");
      expect(result.userName).toBe("testuser");
    });

    it("should throw error for invalid input", () => {
      const invalidUser = { uid: "" };
      expect(() => validateCloudSyncUser(invalidUser)).toThrow();
    });
  });

  describe("validateCloudSyncUserSafe", () => {
    it("should return success for valid user", () => {
      const validUser = {
        uid: "user-123",
        userName: "testuser",
      };

      const result = validateCloudSyncUserSafe(validUser);
      expect(result.success).toBe(true);
    });

    it("should return error for invalid user", () => {
      const invalidUser = { uid: "", userName: "" };
      const result = validateCloudSyncUserSafe(invalidUser);
      expect(result.success).toBe(false);
    });
  });

  describe("validateChunkedSyncStats", () => {
    it("should return validated stats for valid input", () => {
      const validStats = {
        maxChunkSize: 900000,
        maxArrayChunkSize: 5000,
        isInitialized: true,
      };

      const result = validateChunkedSyncStats(validStats);
      expect(result.maxChunkSize).toBe(900000);
    });

    it("should throw error for invalid input", () => {
      const invalidStats = { maxChunkSize: -1 };
      expect(() => validateChunkedSyncStats(invalidStats)).toThrow();
    });
  });

  describe("validateChunkedSyncStatsSafe", () => {
    it("should return success for valid stats", () => {
      const validStats = {
        maxChunkSize: 900000,
        maxArrayChunkSize: 5000,
        isInitialized: true,
      };

      const result = validateChunkedSyncStatsSafe(validStats);
      expect(result.success).toBe(true);
    });

    it("should return error for invalid stats", () => {
      const invalidStats = { maxChunkSize: "not a number" };
      const result = validateChunkedSyncStatsSafe(invalidStats);
      expect(result.success).toBe(false);
    });
  });

  describe("validateLoadedData", () => {
    it("should return validated data for valid input", () => {
      const validData = { transactions: [], envelopes: [] };
      const result = validateLoadedData(validData);
      expect(result).toEqual(validData);
    });

    it("should throw error for invalid input", () => {
      const invalidData = { transactions: "not an array" };
      expect(() => validateLoadedData(invalidData)).toThrow();
    });
  });

  describe("validateLoadedDataSafe", () => {
    it("should return success for valid data", () => {
      const validData = null;
      const result = validateLoadedDataSafe(validData);
      expect(result.success).toBe(true);
    });

    it("should return error for invalid data", () => {
      const invalidData = { transactions: "not an array" };
      const result = validateLoadedDataSafe(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("formatSyncValidationErrors", () => {
    it("should format single validation error", () => {
      // Create a Zod error manually
      const schema = z.object({
        uid: z.string().min(1),
      });
      const parseResult = schema.safeParse({ uid: "" });

      if (!parseResult.success) {
        const { message, details } = formatSyncValidationErrors(parseResult.error, "Test context");

        expect(message).toContain("Test context");
        expect(message).toContain("validation failed");
        expect(details.length).toBeGreaterThan(0);
        expect(details[0]).toContain("uid");
      }
    });

    it("should format multiple validation errors", () => {
      const schema = z.object({
        uid: z.string().min(1),
        userName: z.string().min(1),
      });
      const parseResult = schema.safeParse({ uid: "", userName: "" });

      if (!parseResult.success) {
        const { message, details } = formatSyncValidationErrors(
          parseResult.error,
          "User validation"
        );

        expect(message).toContain("2 error(s)");
        expect(details.length).toBe(2);
      }
    });

    it("should handle root-level errors", () => {
      const schema = z.string().min(1);
      const parseResult = schema.safeParse("");

      if (!parseResult.success) {
        const { details } = formatSyncValidationErrors(parseResult.error, "String validation");

        // Root level errors should show "root" as path
        expect(details.some((d) => d.includes("root"))).toBe(true);
      }
    });
  });
});
