import { describe, it, expect } from "vitest";
import { generateChecksum, validateChecksum } from "../checksumUtils";

describe("checksumUtils", () => {
  describe("generateChecksum", () => {
    it("should generate consistent checksums for same data", async () => {
      const data = { test: "data", number: 123 };

      const checksum1 = await generateChecksum(data);
      const checksum2 = await generateChecksum(data);

      expect(checksum1).toBe(checksum2);
      expect(typeof checksum1).toBe("string");
      expect(checksum1.length).toBeGreaterThan(0);
    });

    it("should generate different checksums for different data", async () => {
      const data1 = { test: "data1" };
      const data2 = { test: "data2" };

      const checksum1 = await generateChecksum(data1);
      const checksum2 = await generateChecksum(data2);

      expect(checksum1).not.toBe(checksum2);
    });

    it("should handle arrays", async () => {
      const data = [1, 2, 3, "test"];
      const checksum = await generateChecksum(data);

      expect(typeof checksum).toBe("string");
      expect(checksum.length).toBeGreaterThan(0);
    });

    it("should handle nested objects", async () => {
      const data = {
        nested: {
          deep: {
            value: "test",
            array: [1, 2, 3],
          },
        },
      };

      const checksum = await generateChecksum(data);
      expect(typeof checksum).toBe("string");
    });

    it("should handle null and undefined", async () => {
      const nullChecksum = await generateChecksum(null);
      const undefinedChecksum = await generateChecksum(undefined);

      expect(typeof nullChecksum).toBe("string");
      expect(typeof undefinedChecksum).toBe("string");
      expect(nullChecksum).toBe(undefinedChecksum); // Both become "null"
    });

    it("should handle special characters and unicode", async () => {
      const data = {
        emoji: "😀🎉",
        special: "!@#$%^&*()",
        unicode: "café résumé naïve",
      };

      const checksum = await generateChecksum(data);
      expect(typeof checksum).toBe("string");
    });
  });

  describe("validateChecksum", () => {
    it("should validate correct checksums", async () => {
      const data = { test: "validation", items: [1, 2, 3] };
      const checksum = await generateChecksum(data);

      const isValid = await validateChecksum(data, checksum);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect checksums", async () => {
      const data = { test: "validation" };
      const wrongChecksum = "invalid-checksum";

      const isValid = await validateChecksum(data, wrongChecksum);
      expect(isValid).toBe(false);
    });

    it("should detect data corruption", async () => {
      const originalData = { important: "data", count: 100 };
      const checksum = await generateChecksum(originalData);

      const corruptedData = { important: "data", count: 101 };
      const isValid = await validateChecksum(corruptedData, checksum);

      expect(isValid).toBe(false);
    });

    it("should handle empty checksum", async () => {
      const data = { test: "data" };
      const isValid = await validateChecksum(data, "");

      expect(isValid).toBe(false);
    });

    it("should handle null/undefined inputs", async () => {
      const checksum = await generateChecksum({ test: "data" });

      expect(await validateChecksum(null, checksum)).toBe(false);
      expect(await validateChecksum(undefined, checksum)).toBe(false);
      expect(await validateChecksum({ test: "data" }, null)).toBe(false);
      expect(await validateChecksum({ test: "data" }, undefined)).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle large objects", async () => {
      const largeData = {
        items: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          data: `data-${i}`.repeat(10),
        })),
      };

      const checksum = await generateChecksum(largeData);
      const isValid = await validateChecksum(largeData, checksum);

      expect(isValid).toBe(true);
      expect(typeof checksum).toBe("string");
    });

    it("should handle circular references safely", async () => {
      const data: Record<string, unknown> = { name: "test" };
      data.self = data; // Create circular reference

      // Should not throw, but handle gracefully
      const checksum = await generateChecksum(data);
      expect(typeof checksum).toBe("string");
    });

    it("should be consistent across multiple calls", async () => {
      const data = {
        timestamp: 1234567890,
        users: ["alice", "bob", "charlie"],
        config: { enabled: true, timeout: 5000 },
      };

      const checksums = await Promise.all([
        generateChecksum(data),
        generateChecksum(data),
        generateChecksum(data),
        generateChecksum(data),
        generateChecksum(data),
      ]);

      // All checksums should be identical
      const firstChecksum = checksums[0];
      expect(checksums.every((c) => c === firstChecksum)).toBe(true);
    });
  });
});
