import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import {
  validateComponentProps,
  isValidProps,
  validateComponentPropsStrict,
} from "../propValidator";
import logger from "@/utils/core/common/logger";

// Mock the logger
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Simple test schema
const TestPropsSchema = z.object({
  name: z.string(),
  age: z.number().positive(),
  isActive: z.boolean().optional(),
});

describe("propValidator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateComponentProps", () => {
    it("should return true for valid props", () => {
      const validProps = {
        name: "John Doe",
        age: 30,
        isActive: true,
      };

      const result = validateComponentProps("TestComponent", validProps, TestPropsSchema);

      expect(result).toBe(true);
    });

    it("should return false and log warning for invalid props when in development", () => {
      const invalidProps = {
        name: "John Doe",
        age: -5, // Invalid: should be positive
      };

      const result = validateComponentProps("TestComponent", invalidProps, TestPropsSchema);

      // In development mode, should return false and log
      // In production mode, would return true
      if (import.meta.env.MODE === "development") {
        expect(result).toBe(false);
        expect(logger.warn).toHaveBeenCalled();
        expect(logger.warn).toHaveBeenCalledWith(
          expect.stringContaining("Invalid props for TestComponent"),
          expect.any(Object)
        );
      } else {
        expect(result).toBe(true);
      }
    });

    it("should handle missing required fields", () => {
      const invalidProps = {
        name: "John Doe",
        // Missing age
      };

      const result = validateComponentProps("TestComponent", invalidProps, TestPropsSchema);

      if (import.meta.env.MODE === "development") {
        expect(result).toBe(false);
        expect(logger.warn).toHaveBeenCalled();
      }
    });

    it("should handle type mismatches", () => {
      const invalidProps = {
        name: "John Doe",
        age: "thirty", // Should be number
      };

      const result = validateComponentProps("TestComponent", invalidProps, TestPropsSchema);

      if (import.meta.env.MODE === "development") {
        expect(result).toBe(false);
        expect(logger.warn).toHaveBeenCalled();
      }
    });
  });

  describe("isValidProps", () => {
    it("should return true for valid props", () => {
      const validProps = {
        name: "John Doe",
        age: 30,
      };

      const result = isValidProps(validProps, TestPropsSchema);

      expect(result).toBe(true);
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it("should return false for invalid props without logging", () => {
      const invalidProps = {
        name: "John Doe",
        age: -5,
      };

      const result = isValidProps(invalidProps, TestPropsSchema);

      // In development mode, should return false
      // In production mode, would return true
      if (import.meta.env.MODE === "development") {
        expect(result).toBe(false);
      }
      expect(logger.warn).not.toHaveBeenCalled(); // Never logs
    });
  });

  describe("validateComponentPropsStrict", () => {
    it("should not throw for valid props", () => {
      const validProps = {
        name: "John Doe",
        age: 30,
      };

      expect(() =>
        validateComponentPropsStrict("TestComponent", validProps, TestPropsSchema)
      ).not.toThrow();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it("should throw for invalid props when in development", () => {
      const invalidProps = {
        name: "John Doe",
        age: -5,
      };

      if (import.meta.env.MODE === "development") {
        expect(() =>
          validateComponentPropsStrict("TestComponent", invalidProps, TestPropsSchema)
        ).toThrow("Invalid props for TestComponent");
        expect(logger.error).toHaveBeenCalled();
      } else {
        expect(() =>
          validateComponentPropsStrict("TestComponent", invalidProps, TestPropsSchema)
        ).not.toThrow();
      }
    });

    it("should format error message with all validation issues", () => {
      const invalidProps = {
        name: 123, // Wrong type
        age: -5, // Invalid value
      };

      if (import.meta.env.MODE === "development") {
        try {
          validateComponentPropsStrict("TestComponent", invalidProps, TestPropsSchema);
          expect.fail("Should have thrown an error");
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          const errorMessage = (error as Error).message;
          expect(errorMessage).toContain("Invalid props for TestComponent");
          expect(errorMessage).toContain("name");
          expect(errorMessage).toContain("age");
        }
      }
    });
  });

  describe("Complex schema validation", () => {
    const ComplexSchema = z.object({
      user: z.object({
        name: z.string(),
        email: z.string().email(),
      }),
      items: z.array(
        z.object({
          id: z.string(),
          quantity: z.number().positive(),
        })
      ),
      callback: z.function(),
    });

    it("should validate nested objects", () => {
      const validProps = {
        user: {
          name: "John Doe",
          email: "john@example.com",
        },
        items: [
          { id: "1", quantity: 5 },
          { id: "2", quantity: 3 },
        ],
        callback: () => {},
      };

      const result = validateComponentProps("ComplexComponent", validProps, ComplexSchema);

      expect(result).toBe(true);
    });

    it("should detect errors in nested objects", () => {
      const invalidProps = {
        user: {
          name: "John Doe",
          email: "invalid-email", // Invalid email
        },
        items: [{ id: "1", quantity: -5 }], // Invalid quantity
        callback: () => {},
      };

      const result = validateComponentProps("ComplexComponent", invalidProps, ComplexSchema);

      if (import.meta.env.MODE === "development") {
        expect(result).toBe(false);
        expect(logger.warn).toHaveBeenCalled();
      }
    });

    it("should validate function types", () => {
      const invalidProps = {
        user: {
          name: "John Doe",
          email: "john@example.com",
        },
        items: [],
        callback: "not a function", // Should be a function
      };

      const result = validateComponentProps("ComplexComponent", invalidProps, ComplexSchema);

      if (import.meta.env.MODE === "development") {
        expect(result).toBe(false);
        expect(logger.warn).toHaveBeenCalled();
      }
    });
  });
});
