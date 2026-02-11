import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import {
  validateWithSchema,
  safeValidateWithSchema,
  validateArrayWithSchema,
  safeValidateArrayWithSchema,
} from "../validation";

// Mock logger
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("Validation Utilities", () => {
  const userSchema = z.object({
    id: z.string(),
    age: z.number().min(18),
  });

  describe("validateWithSchema", () => {
    it("should return validated data on success", () => {
      const data = { id: "1", age: 20 };
      const result = validateWithSchema(userSchema, data, "User");
      expect(result).toEqual(data);
    });

    it("should throw error on validation failure", () => {
      const data = { id: "1", age: 10 }; // Invalid age
      expect(() => validateWithSchema(userSchema, data, "User")).toThrow("Invalid User");
    });

    it("should propagate non-Zod errors", () => {
      const schema = {
        parse: () => {
          throw new Error("Random error");
        },
      } as any;
      expect(() => validateWithSchema(schema, {}, "User")).toThrow("Random error");
    });
  });

  describe("safeValidateWithSchema", () => {
    it("should return success result", () => {
      const data = { id: "1", age: 20 };
      const result = safeValidateWithSchema(userSchema, data, "User");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it("should return failure result", () => {
      const data = { id: "1", age: 10 };
      const result = safeValidateWithSchema(userSchema, data, "User");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("number to be >=");
      }
    });
  });

  describe("validateArrayWithSchema", () => {
    it("should validate array correctly", () => {
      const data = [
        { id: "1", age: 20 },
        { id: "2", age: 25 },
      ];
      const result = validateArrayWithSchema(userSchema, data, "User");
      expect(result).toEqual(data);
    });

    it("should throw on invalid item index", () => {
      const data = [
        { id: "1", age: 20 },
        { id: "2", age: 10 }, // Invalid
      ];
      expect(() => validateArrayWithSchema(userSchema, data, "User")).toThrow(
        "Invalid User at index 1"
      );
    });

    it("should propagate non-Zod errors in array", () => {
      const schema = {
        parse: () => {
          throw new Error("Random error");
        },
      } as any;
      expect(() => validateArrayWithSchema(schema, [{}], "User")).toThrow("Random error");
    });
  });

  describe("safeValidateArrayWithSchema", () => {
    it("should return success for valid array", () => {
      const data = [
        { id: "1", age: 20 },
        { id: "2", age: 25 },
      ];
      const result = safeValidateArrayWithSchema(userSchema, data, "User");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it("should return failure with indices for invalid items", () => {
      const data = [
        { id: "1", age: 20 },
        { id: "2", age: 10 }, // Invalid
        { id: "3", age: 30 },
        { id: "4", age: 5 }, // Invalid
      ];
      const result = safeValidateArrayWithSchema(userSchema, data, "User");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.failedIndices).toEqual([1, 3]);
        expect(result.error).toBeDefined();
      }
    });
  });
});
