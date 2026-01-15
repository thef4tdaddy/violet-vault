import { describe, it, expect } from "vitest";
import {
  validateSavingsGoalForm,
  SAVINGS_CATEGORIES,
  SAVINGS_PRIORITIES,
} from "../savingsFormUtils";

describe("savingsFormUtils", () => {
  describe("validateSavingsGoalForm - Zod validation", () => {
    it("should return empty array for valid form data", () => {
      const validFormData = {
        type: "goal",
        name: "Emergency Fund",
        targetAmount: "5000",
        currentAmount: "1000",
        targetDate: "2027-12-31",
        category: "Emergency Fund",
        color: "#3B82F6",
        description: "Save for emergencies",
        priority: "high",
      };

      const errors = validateSavingsGoalForm(validFormData);
      expect(errors).toEqual([]);
    });

    it("should validate required name field", () => {
      const invalidFormData = {
        type: "goal",
        name: "",
        targetAmount: "5000",
        currentAmount: "1000",
        category: "Emergency Fund",
        color: "#3B82F6",
        priority: "medium",
      };

      const errors = validateSavingsGoalForm(invalidFormData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((err) => err.includes("Goal name is required"))).toBe(true);
    });

    it("should validate target amount is positive", () => {
      const invalidFormData = {
        name: "Emergency Fund",
        targetAmount: "0",
        currentAmount: "0",
        category: "Emergency Fund",
        color: "#3B82F6",
        priority: "medium",
      };

      const errors = validateSavingsGoalForm(invalidFormData);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((err) => err.includes("Target amount must be a valid positive number"))
      ).toBe(true);
    });

    it("should validate negative target amount", () => {
      const invalidFormData = {
        name: "Emergency Fund",
        targetAmount: "-100",
        currentAmount: "0",
        category: "Emergency Fund",
        color: "#3B82F6",
        priority: "medium",
      };

      const errors = validateSavingsGoalForm(invalidFormData);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((err) => err.includes("Target amount must be a valid positive number"))
      ).toBe(true);
    });

    it("should validate current amount is not negative", () => {
      const invalidFormData = {
        name: "Emergency Fund",
        targetAmount: "5000",
        currentAmount: "-100",
        category: "Emergency Fund",
        color: "#3B82F6",
        priority: "medium",
      };

      const errors = validateSavingsGoalForm(invalidFormData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((err) => err.includes("Current amount cannot be negative"))).toBe(true);
    });

    it("should validate current amount does not exceed target amount", () => {
      const invalidFormData = {
        name: "Emergency Fund",
        targetAmount: "5000",
        currentAmount: "6000",
        category: "Emergency Fund",
        color: "#3B82F6",
        priority: "medium",
      };

      const errors = validateSavingsGoalForm(invalidFormData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((err) => err.includes("Current amount cannot exceed target amount"))).toBe(
        true
      );
    });

    it("should validate target date is not in the past", () => {
      const pastDate = "2020-01-01";
      const invalidFormData = {
        name: "Emergency Fund",
        targetAmount: "5000",
        currentAmount: "1000",
        targetDate: pastDate,
        category: "Emergency Fund",
        color: "#3B82F6",
        priority: "medium",
      };

      const errors = validateSavingsGoalForm(invalidFormData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((err) => err.includes("Target date cannot be in the past"))).toBe(true);
    });

    it("should validate color format", () => {
      const invalidFormData = {
        name: "Emergency Fund",
        targetAmount: "5000",
        currentAmount: "1000",
        category: "Emergency Fund",
        color: "invalid-color",
        priority: "medium",
      };

      const errors = validateSavingsGoalForm(invalidFormData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((err) => err.includes("Invalid color format"))).toBe(true);
    });

    it("should validate name length does not exceed 100 characters", () => {
      const longName = "a".repeat(101);
      const invalidFormData = {
        name: longName,
        targetAmount: "5000",
        currentAmount: "1000",
        category: "Emergency Fund",
        color: "#3B82F6",
        priority: "medium",
      };

      const errors = validateSavingsGoalForm(invalidFormData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((err) => err.includes("Goal name cannot exceed 100 characters"))).toBe(
        true
      );
    });

    it("should validate description length does not exceed 500 characters", () => {
      const longDescription = "a".repeat(501);
      const invalidFormData = {
        name: "Emergency Fund",
        targetAmount: "5000",
        currentAmount: "1000",
        category: "Emergency Fund",
        color: "#3B82F6",
        description: longDescription,
        priority: "medium",
      };

      const errors = validateSavingsGoalForm(invalidFormData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((err) => err.includes("Description cannot exceed 500 characters"))).toBe(
        true
      );
    });

    it("should allow optional target date", () => {
      const validFormData = {
        type: "goal",
        name: "Emergency Fund",
        targetAmount: "5000",
        currentAmount: "1000",
        category: "Emergency Fund",
        color: "#3B82F6",
        priority: "medium",
      };

      const errors = validateSavingsGoalForm(validFormData);
      expect(errors).toEqual([]);
    });

    it("should allow optional description", () => {
      const validFormData = {
        type: "goal",
        name: "Emergency Fund",
        targetAmount: "5000",
        currentAmount: "1000",
        category: "Emergency Fund",
        color: "#3B82F6",
        priority: "medium",
      };

      const errors = validateSavingsGoalForm(validFormData);
      expect(errors).toEqual([]);
    });

    it("should handle string and number types for amounts", () => {
      const validFormDataWithStrings = {
        name: "Emergency Fund",
        targetAmount: "5000",
        currentAmount: "1000",
        category: "Emergency Fund",
        color: "#3B82F6",
        priority: "medium",
      };

      const errors1 = validateSavingsGoalForm(validFormDataWithStrings);
      expect(errors1).toEqual([]);

      // Schema expects strings, not numbers
      const validFormDataWithNumbers = {
        name: "Emergency Fund",
        targetAmount: 5000,
        currentAmount: 1000,
        category: "Emergency Fund",
        color: "#3B82F6",
        priority: "medium",
      };

      const errors2 = validateSavingsGoalForm(validFormDataWithNumbers);
      // Numbers should fail validation since schema expects strings
      expect(errors2.length).toBeGreaterThan(0);
      expect(errors2.some((err) => err.includes("expected string"))).toBe(true);
    });

    it("should validate priority enum values", () => {
      const invalidFormData = {
        name: "Emergency Fund",
        targetAmount: "5000",
        currentAmount: "1000",
        category: "Emergency Fund",
        color: "#3B82F6",
        priority: "invalid-priority",
      };

      const errors = validateSavingsGoalForm(invalidFormData);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should trim name and remove whitespace", () => {
      const formData = {
        name: "  Emergency Fund  ",
        targetAmount: "5000",
        currentAmount: "1000",
        category: "Emergency Fund",
        color: "#3B82F6",
        priority: "medium",
      };

      const errors = validateSavingsGoalForm(formData);
      expect(errors).toEqual([]);
    });
  });

  describe("SAVINGS_CATEGORIES constant", () => {
    it("should include expected categories", () => {
      expect(SAVINGS_CATEGORIES).toContain("Emergency Fund");
      expect(SAVINGS_CATEGORIES).toContain("Vacation");
      expect(SAVINGS_CATEGORIES).toContain("General");
    });
  });

  describe("SAVINGS_PRIORITIES constant", () => {
    it("should include expected priorities", () => {
      const priorityValues = SAVINGS_PRIORITIES.map((p) => p.value);
      expect(priorityValues).toContain("high");
      expect(priorityValues).toContain("medium");
      expect(priorityValues).toContain("low");
    });

    it("should have consistent structure", () => {
      SAVINGS_PRIORITIES.forEach((priority) => {
        expect(priority).toHaveProperty("value");
        expect(priority).toHaveProperty("label");
        expect(priority).toHaveProperty("color");
      });
    });
  });
});
