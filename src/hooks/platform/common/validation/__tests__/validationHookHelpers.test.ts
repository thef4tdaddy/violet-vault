/**
 * Tests for Validation Hook Helpers
 * Part of Issue #987 - Comprehensive Zod Schema Implementation (Phase 3)
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  parseWithSchema,
  mergeErrors,
  removeErrors,
  hasErrors,
  getErrorMessages,
  hasFormChanged,
} from "../validationHookHelpers";

describe("validationHookHelpers", () => {
  describe("parseWithSchema", () => {
    const testSchema = z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email"),
      age: z.number().min(0, "Age must be positive"),
    });

    it("should return success for valid data", () => {
      const data = { name: "John", email: "john@example.com", age: 25 };
      const result = parseWithSchema(testSchema, data);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.errors).toEqual({});
    });

    it("should return errors for invalid data", () => {
      const data = { name: "", email: "invalid", age: -5 };
      const result = parseWithSchema(testSchema, data);

      expect(result.success).toBe(false);
      expect(result.errors.name).toBe("Name is required");
      expect(result.errors.email).toBe("Invalid email");
      expect(result.errors.age).toBe("Age must be positive");
    });

    it("should handle partial validation errors", () => {
      const data = { name: "John", email: "invalid", age: 25 };
      const result = parseWithSchema(testSchema, data);

      expect(result.success).toBe(false);
      expect(result.errors.name).toBeUndefined();
      expect(result.errors.email).toBe("Invalid email");
      expect(result.errors.age).toBeUndefined();
    });
  });

  describe("mergeErrors", () => {
    it("should merge two error objects", () => {
      const existing = { name: "Name error", email: "Email error" };
      const newErrors = { email: "New email error", age: "Age error" };
      const result = mergeErrors(existing, newErrors);

      expect(result).toEqual({
        name: "Name error",
        email: "New email error",
        age: "Age error",
      });
    });

    it("should handle empty error objects", () => {
      const existing = { name: "Name error" };
      const newErrors = {};
      const result = mergeErrors(existing, newErrors);

      expect(result).toEqual({ name: "Name error" });
    });
  });

  describe("removeErrors", () => {
    it("should remove specified fields from errors", () => {
      const errors = {
        name: "Name error",
        email: "Email error",
        age: "Age error",
      };
      const result = removeErrors(errors, ["email", "age"]);

      expect(result).toEqual({ name: "Name error" });
    });

    it("should handle non-existent fields gracefully", () => {
      const errors = { name: "Name error" };
      const result = removeErrors(errors, ["email" as keyof typeof errors]);

      expect(result).toEqual({ name: "Name error" });
    });

    it("should return empty object when removing all errors", () => {
      const errors = { name: "Name error" };
      const result = removeErrors(errors, ["name"]);

      expect(result).toEqual({});
    });
  });

  describe("hasErrors", () => {
    it("should return true when errors exist", () => {
      const errors = { name: "Name error" };
      expect(hasErrors(errors)).toBe(true);
    });

    it("should return false when no errors exist", () => {
      const errors = {};
      expect(hasErrors(errors)).toBe(false);
    });
  });

  describe("getErrorMessages", () => {
    it("should extract all error messages", () => {
      const errors = {
        name: "Name error",
        email: "Email error",
        age: "Age error",
      };
      const messages = getErrorMessages(errors);

      expect(messages).toEqual(["Name error", "Email error", "Age error"]);
    });

    it("should return empty array when no errors", () => {
      const errors = {};
      const messages = getErrorMessages(errors);

      expect(messages).toEqual([]);
    });
  });

  describe("hasFormChanged", () => {
    it("should return true when form data has changed", () => {
      const initial = { name: "John", email: "john@example.com" };
      const current = { name: "Jane", email: "john@example.com" };

      expect(hasFormChanged(current, initial)).toBe(true);
    });

    it("should return false when form data is unchanged", () => {
      const initial = { name: "John", email: "john@example.com" };
      const current = { name: "John", email: "john@example.com" };

      expect(hasFormChanged(current, initial)).toBe(false);
    });

    it("should handle nested object changes", () => {
      const initial = { user: { name: "John" } };
      const current = { user: { name: "Jane" } };

      expect(hasFormChanged(current, initial)).toBe(true);
    });
  });
});
