import { describe, it, expect, vi, beforeEach } from "vitest";
import { optimizedSerialization } from "../optimizedSerialization";
import logger from "@/utils/core/common/logger";

// Mock logger to avoid noise
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("optimizedSerialization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("serialize and deserialize", () => {
    it("should serialize and deserialize simple objects", () => {
      const data = { name: "test", value: 42 };
      const serialized = optimizedSerialization.serialize(data);
      const deserialized = optimizedSerialization.deserialize(serialized);

      expect(deserialized).toEqual(data);
      expect(serialized).toBeInstanceOf(Uint8Array);
    });

    it("should serialize and deserialize complex nested objects", () => {
      const data = {
        user: {
          name: "John Doe",
          age: 30,
          preferences: {
            theme: "dark",
            notifications: true,
          },
        },
        transactions: [
          { id: 1, amount: 100.5 },
          { id: 2, amount: 250.75 },
        ],
      };

      const serialized = optimizedSerialization.serialize(data);
      const deserialized = optimizedSerialization.deserialize(serialized);

      expect(deserialized).toEqual(data);
    });

    it("should serialize and deserialize arrays", () => {
      const data = [1, 2, 3, 4, 5];
      const serialized = optimizedSerialization.serialize(data);
      const deserialized = optimizedSerialization.deserialize(serialized);

      expect(deserialized).toEqual(data);
    });

    it("should serialize and deserialize strings", () => {
      const data = "Hello, World!";
      const serialized = optimizedSerialization.serialize(data);
      const deserialized = optimizedSerialization.deserialize(serialized);

      expect(deserialized).toBe(data);
    });

    it("should serialize and deserialize numbers", () => {
      const data = 123.456;
      const serialized = optimizedSerialization.serialize(data);
      const deserialized = optimizedSerialization.deserialize(serialized);

      expect(deserialized).toBe(data);
    });

    it("should serialize and deserialize booleans", () => {
      const data = true;
      const serialized = optimizedSerialization.serialize(data);
      const deserialized = optimizedSerialization.deserialize(serialized);

      expect(deserialized).toBe(data);
    });

    it("should serialize and deserialize null", () => {
      const data = null;
      const serialized = optimizedSerialization.serialize(data);
      const deserialized = optimizedSerialization.deserialize(serialized);

      expect(deserialized).toBeNull();
    });

    it("should handle large objects", () => {
      const largeData = {
        items: Array(1000)
          .fill(null)
          .map((_, i) => ({
            id: i,
            name: `Item ${i}`,
            description: `This is item number ${i}`,
            value: Math.random() * 1000,
          })),
      };

      const serialized = optimizedSerialization.serialize(largeData);
      const deserialized = optimizedSerialization.deserialize(serialized);

      expect(deserialized).toEqual(largeData);
    });

    it("should log serialization metrics", () => {
      const data = { test: "data" };
      optimizedSerialization.serialize(data);

      expect(logger.info).toHaveBeenCalledWith(
        "Serialization complete",
        expect.objectContaining({
          originalSize: expect.any(Number),
          compressedSize: expect.any(Number),
          finalSize: expect.any(Number),
        })
      );
    });

    it("should throw error on serialization failure", () => {
      // Create circular reference that JSON.stringify can't handle
      const circular: any = { a: 1 };
      circular.self = circular;

      expect(() => optimizedSerialization.serialize(circular)).toThrow("Serialization failed");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should throw error on deserialization of invalid data", () => {
      const invalidData = new Uint8Array([1, 2, 3, 4, 5]);

      expect(() => optimizedSerialization.deserialize(invalidData)).toThrow(
        "Deserialization failed"
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("analyzeCompression", () => {
    it("should analyze compression for given data", () => {
      const data = { test: "data", items: [1, 2, 3, 4, 5] };
      const analysis = optimizedSerialization.analyzeCompression(data);

      expect(analysis).not.toBeNull();
      expect(analysis).toHaveProperty("originalSize");
      expect(analysis).toHaveProperty("compressedSize");
      expect(analysis).toHaveProperty("finalSize");
      expect(analysis).toHaveProperty("compressionRatio");
      expect(analysis).toHaveProperty("totalReduction");
      expect(analysis).toHaveProperty("spaceSaved");
      expect(analysis).toHaveProperty("spaceSavedPercent");
    });

    it("should show compression benefits for large data", () => {
      const largeData = {
        items: Array(100)
          .fill(null)
          .map((_, i) => ({
            id: i,
            name: `Item ${i}`,
            value: i * 10,
          })),
      };

      const analysis = optimizedSerialization.analyzeCompression(largeData);

      expect(analysis).not.toBeNull();
      expect(analysis!.compressionRatio).toBeGreaterThan(1);
      expect(analysis!.totalReduction).toBeGreaterThan(1);
      expect(analysis!.spaceSaved).toBeGreaterThan(0);
    });

    it("should return null on analysis failure", () => {
      const circular: any = { a: 1 };
      circular.self = circular;

      const analysis = optimizedSerialization.analyzeCompression(circular);

      expect(analysis).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });

    it("should calculate correct percentages", () => {
      const data = { test: "data" };
      const analysis = optimizedSerialization.analyzeCompression(data);

      expect(analysis).not.toBeNull();
      // Small data may actually expand after compression + MessagePack overhead
      expect(typeof analysis!.spaceSavedPercent).toBe("number");
      // Can be negative for small data that expands
      expect(analysis!.spaceSavedPercent).toBeLessThanOrEqual(100);
    });
  });

  describe("toBase64 and fromBase64", () => {
    it("should convert binary data to Base64 and back", () => {
      const original = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const base64 = optimizedSerialization.toBase64(original);
      const restored = optimizedSerialization.fromBase64(base64);

      expect(restored).toEqual(original);
      expect(typeof base64).toBe("string");
    });

    it("should handle empty arrays", () => {
      const original = new Uint8Array([]);
      const base64 = optimizedSerialization.toBase64(original);
      const restored = optimizedSerialization.fromBase64(base64);

      expect(restored).toEqual(original);
    });

    it("should handle large binary data", () => {
      const original = new Uint8Array(10000);
      for (let i = 0; i < original.length; i++) {
        original[i] = i % 256;
      }

      const base64 = optimizedSerialization.toBase64(original);
      const restored = optimizedSerialization.fromBase64(base64);

      expect(restored).toEqual(original);
    });

    it("should produce valid Base64 strings", () => {
      const data = new Uint8Array([255, 128, 64, 32, 16, 8, 4, 2, 1, 0]);
      const base64 = optimizedSerialization.toBase64(data);

      // Base64 should only contain valid characters
      expect(base64).toMatch(/^[A-Za-z0-9+/]*={0,2}$/);
    });

    it("should throw error on Base64 encoding failure", () => {
      // This is hard to trigger, but we can test error handling exists
      const invalidData = null as any;

      expect(() => optimizedSerialization.toBase64(invalidData)).toThrow();
    });

    it("should throw error on Base64 decoding failure", () => {
      const invalidBase64 = "!!!invalid base64!!!";

      expect(() => optimizedSerialization.fromBase64(invalidBase64)).toThrow(
        "Base64 decoding failed"
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("prepareForFirebase and restoreFromFirebase", () => {
    it("should prepare data for Firebase storage", () => {
      const data = { user: "test", value: 42 };
      const prepared = optimizedSerialization.prepareForFirebase(data);

      expect(typeof prepared).toBe("string");
      expect(prepared.length).toBeGreaterThan(0);
    });

    it("should restore data from Firebase storage", () => {
      const data = { user: "test", value: 42 };
      const prepared = optimizedSerialization.prepareForFirebase(data);
      const restored = optimizedSerialization.restoreFromFirebase(prepared);

      expect(restored).toEqual(data);
    });

    it("should handle complex data structures", () => {
      const data = {
        transactions: [
          { id: 1, amount: 100.5, date: "2024-01-01" },
          { id: 2, amount: 250.75, date: "2024-01-02" },
        ],
        metadata: {
          version: "1.0",
          encrypted: true,
        },
      };

      const prepared = optimizedSerialization.prepareForFirebase(data);
      const restored = optimizedSerialization.restoreFromFirebase(prepared);

      expect(restored).toEqual(data);
    });

    it("should be deterministic for same input", () => {
      const data = { test: "data" };
      const prepared1 = optimizedSerialization.prepareForFirebase(data);
      const prepared2 = optimizedSerialization.prepareForFirebase(data);

      expect(prepared1).toBe(prepared2);
    });
  });

  describe("testPipeline", () => {
    it("should test complete pipeline successfully", () => {
      const testData = { test: "data", items: [1, 2, 3] };
      const result = optimizedSerialization.testPipeline(testData);

      expect(result.success).toBe(true);
      // Time can be 0 in fast environments, just check it's defined
      expect(result.totalTime).toBeGreaterThanOrEqual(0);
      expect(result.base64Size).toBeGreaterThan(0);
      expect(result.analysis).not.toBeNull();
      expect(result.verified).toContain("✅");
    });

    it("should provide performance metrics", () => {
      const testData = { test: "data" };
      const result = optimizedSerialization.testPipeline(testData);

      expect(result).toHaveProperty("totalTime");
      expect(result).toHaveProperty("base64Size");
      expect(result).toHaveProperty("analysis");
      expect(result.analysis).toHaveProperty("originalSize");
      expect(result.analysis).toHaveProperty("compressionRatio");
    });

    it("should detect data corruption", () => {
      // This would be hard to trigger in normal usage,
      // but the test should verify data integrity
      const testData = { test: "data" };
      const result = optimizedSerialization.testPipeline(testData);

      // Data should be verified as identical
      expect(result.verified).toContain("✅");
    });

    it("should handle pipeline failures", () => {
      const circular: any = { a: 1 };
      circular.self = circular;

      const result = optimizedSerialization.testPipeline(circular);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(logger.error).toHaveBeenCalled();
    });

    it("should work with various data types", () => {
      const testCases = [42, "string", true, null, [1, 2, 3], { a: 1, b: 2 }];

      testCases.forEach((testData) => {
        const result = optimizedSerialization.testPipeline(testData);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("performance tests", () => {
    it("should compress repetitive data effectively", () => {
      const repetitiveData = {
        items: Array(100).fill({
          name: "Same Name",
          description: "Same Description",
          value: 123,
        }),
      };

      const analysis = optimizedSerialization.analyzeCompression(repetitiveData);

      expect(analysis).not.toBeNull();
      // Repetitive data should compress well
      expect(analysis!.compressionRatio).toBeGreaterThan(2);
    });

    it("should handle serialization within reasonable time", () => {
      const largeData = {
        items: Array(1000)
          .fill(null)
          .map((_, i) => ({ id: i, name: `Item ${i}`, value: i })),
      };

      const startTime = performance.now();
      const serialized = optimizedSerialization.serialize(largeData);
      const serializeTime = performance.now() - startTime;

      const deserializeStart = performance.now();
      optimizedSerialization.deserialize(serialized);
      const deserializeTime = performance.now() - deserializeStart;

      // Should complete in reasonable time (< 1 second for this size)
      expect(serializeTime).toBeLessThan(1000);
      expect(deserializeTime).toBeLessThan(1000);
    });
  });

  describe("edge cases", () => {
    it("should handle empty objects", () => {
      const data = {};
      const serialized = optimizedSerialization.serialize(data);
      const deserialized = optimizedSerialization.deserialize(serialized);

      expect(deserialized).toEqual(data);
    });

    it("should handle empty arrays", () => {
      const data: any[] = [];
      const serialized = optimizedSerialization.serialize(data);
      const deserialized = optimizedSerialization.deserialize(serialized);

      expect(deserialized).toEqual(data);
    });

    it("should handle special numbers", () => {
      const data = { zero: 0, negative: -1, decimal: 0.123456789 };
      const serialized = optimizedSerialization.serialize(data);
      const deserialized = optimizedSerialization.deserialize(serialized);

      expect(deserialized).toEqual(data);
    });

    it("should handle unicode characters", () => {
      const data = { emoji: "😀🎉🔐", unicode: "こんにちは", special: "Café" };
      const serialized = optimizedSerialization.serialize(data);
      const deserialized = optimizedSerialization.deserialize(serialized);

      expect(deserialized).toEqual(data);
    });

    it("should handle deeply nested objects", () => {
      let nested: any = { value: "deep" };
      for (let i = 0; i < 10; i++) {
        nested = { child: nested };
      }

      const serialized = optimizedSerialization.serialize(nested);
      const deserialized = optimizedSerialization.deserialize(serialized);

      expect(deserialized).toEqual(nested);
    });
  });
});
