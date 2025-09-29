/**
 * TypeScript-driven tests for frequencyCalculations
 * Testing edge cases and type safety revealed by TypeScript conversion
 */
import { describe, it, expect } from "vitest";
import {
  FREQUENCY_MULTIPLIERS,
  LEGACY_MULTIPLIERS,
  convertFrequency,
  toBiweekly,
  toMonthly,
  toYearly,
  getMultiplier,
  calculatePaycheckAmount,
  isValidFrequency,
  getFrequencyOptions,
  getFrequencyDisplayText,
  type Frequency,
  type FrequencyMultipliers,
  type FrequencyOption,
} from "../frequencyCalculations";

describe("frequencyCalculations - Type Safety & Edge Cases", () => {
  describe("Type Definitions", () => {
    it("should have properly typed frequency multipliers", () => {
      const frequencies: Frequency[] = ["weekly", "biweekly", "monthly", "quarterly", "yearly"];
      
      frequencies.forEach(freq => {
        expect(typeof FREQUENCY_MULTIPLIERS[freq]).toBe("number");
        expect(typeof LEGACY_MULTIPLIERS[freq]).toBe("number");
        expect(FREQUENCY_MULTIPLIERS[freq]).toBeGreaterThan(0);
        expect(LEGACY_MULTIPLIERS[freq]).toBeGreaterThan(0);
      });
    });

    it("should maintain precision differences between multipliers", () => {
      expect(FREQUENCY_MULTIPLIERS.weekly).toBe(52.1775);
      expect(LEGACY_MULTIPLIERS.weekly).toBe(52);
      expect(FREQUENCY_MULTIPLIERS.weekly).toBeGreaterThan(LEGACY_MULTIPLIERS.weekly);
    });
  });

  describe("convertFrequency - Type Safety", () => {
    it("should handle valid Frequency types", () => {
      const validConversions: Array<[number, Frequency, Frequency, number]> = [
        [1200, "yearly", "monthly", 100], // 1200/year = 100/month
        [100, "monthly", "yearly", 1200], // 100/month = 1200/year
        [26, "biweekly", "yearly", 676], // 26 * 26 = 676/year
        [52, "weekly", "yearly", 2713.23], // 52 * 52.1775 ≈ 2713.23/year (precise)
      ];

      validConversions.forEach(([amount, from, to, expected]) => {
        const result = convertFrequency(amount, from, to, true);
        if (expected > 100) {
          expect(result).toBeCloseTo(expected, 1);
        } else {
          expect(result).toBe(expected);
        }
      });
    });

    it("should handle same frequency conversion", () => {
      const frequencies: Frequency[] = ["weekly", "biweekly", "monthly", "quarterly", "yearly"];
      
      frequencies.forEach(freq => {
        expect(convertFrequency(100, freq, freq)).toBe(100);
        expect(convertFrequency(0, freq, freq)).toBe(0);
        expect(convertFrequency(-50, freq, freq)).toBe(-50);
      });
    });

    it("should handle edge case amounts", () => {
      const edgeCases = [0, -100, 0.01, 999999.99];
      
      edgeCases.forEach(amount => {
        const result = convertFrequency(amount, "monthly", "yearly");
        expect(typeof result).toBe("number");
        expect(result).toBe(amount * 12);
      });
    });

    it("should use precise vs legacy multipliers correctly", () => {
      const amount = 100;
      const preciseResult = convertFrequency(amount, "weekly", "yearly", true);
      const legacyResult = convertFrequency(amount, "weekly", "yearly", false);
      
      expect(preciseResult).toBe(amount * 52.1775);
      expect(legacyResult).toBe(amount * 52);
      expect(preciseResult).toBeGreaterThan(legacyResult);
    });
  });

  describe("Convenience Functions - Type Safety", () => {
    it("should convert to biweekly correctly", () => {
      expect(toBiweekly(1200, "yearly")).toBe(1200 / 26);
      expect(toBiweekly(100, "monthly")).toBe((100 * 12) / 26);
      expect(toBiweekly(50, "biweekly")).toBe(50);
    });

    it("should convert to monthly correctly", () => {
      expect(toMonthly(1200, "yearly")).toBe(100);
      expect(toMonthly(26, "biweekly")).toBe((26 * 26) / 12);
      expect(toMonthly(100, "monthly")).toBe(100);
    });

    it("should convert to yearly correctly", () => {
      expect(toYearly(100, "monthly")).toBe(1200);
      expect(toYearly(26, "biweekly")).toBe(26 * 26);
      expect(toYearly(1000, "yearly")).toBe(1000);
    });
  });

  describe("getMultiplier - Type Safety", () => {
    it("should return correct multipliers for all frequencies", () => {
      const frequencies: Frequency[] = ["weekly", "biweekly", "monthly", "quarterly", "yearly"];
      
      frequencies.forEach(freq => {
        const preciseMultiplier = getMultiplier(freq, true);
        const legacyMultiplier = getMultiplier(freq, false);
        
        expect(preciseMultiplier).toBe(FREQUENCY_MULTIPLIERS[freq]);
        expect(legacyMultiplier).toBe(LEGACY_MULTIPLIERS[freq]);
      });
    });

    it("should handle invalid frequencies with default", () => {
      // TypeScript prevents this at compile time, but testing runtime behavior
      const invalidFreq = "invalid" as Frequency;
      expect(getMultiplier(invalidFreq)).toBe(1);
    });
  });

  describe("calculatePaycheckAmount - Type Safety", () => {
    it("should calculate paycheck amounts correctly", () => {
      // Save $1200/year with biweekly paychecks
      const result = calculatePaycheckAmount(1200, "yearly", "biweekly");
      expect(result).toBe(1200 / 26);
    });

    it("should handle different paycheck frequencies", () => {
      const targetAmount = 1200;
      const targetFreq: Frequency = "yearly";
      
      const frequencies: Frequency[] = ["weekly", "biweekly", "monthly"];
      
      frequencies.forEach(paycheckFreq => {
        const result = calculatePaycheckAmount(targetAmount, targetFreq, paycheckFreq);
        expect(typeof result).toBe("number");
        expect(result).toBeGreaterThan(0);
      });
    });

    it("should use default biweekly frequency", () => {
      const withDefault = calculatePaycheckAmount(1200, "yearly");
      const withExplicit = calculatePaycheckAmount(1200, "yearly", "biweekly");
      
      expect(withDefault).toBe(withExplicit);
    });
  });

  describe("isValidFrequency - Type Guard", () => {
    it("should correctly identify valid frequencies", () => {
      const validFrequencies = ["weekly", "biweekly", "monthly", "quarterly", "yearly"];
      
      validFrequencies.forEach(freq => {
        expect(isValidFrequency(freq)).toBe(true);
        // Type guard should narrow the type
        if (isValidFrequency(freq)) {
          // This should compile without errors
          const multiplier = FREQUENCY_MULTIPLIERS[freq];
          expect(typeof multiplier).toBe("number");
        }
      });
    });

    it("should correctly identify invalid frequencies", () => {
      const invalidFrequencies = ["", "daily", "hourly", "invalid", "WEEKLY", "monthly "];
      
      invalidFrequencies.forEach(freq => {
        expect(isValidFrequency(freq)).toBe(false);
      });
    });
  });

  describe("getFrequencyOptions - Type Safety", () => {
    it("should return properly typed frequency options", () => {
      const preciseOptions = getFrequencyOptions(true);
      const legacyOptions = getFrequencyOptions(false);
      
      [preciseOptions, legacyOptions].forEach(options => {
        expect(Array.isArray(options)).toBe(true);
        
        options.forEach((option: FrequencyOption) => {
          expect(option).toHaveProperty("value");
          expect(option).toHaveProperty("label");
          expect(option).toHaveProperty("multiplier");
          
          expect(typeof option.value).toBe("string");
          expect(typeof option.label).toBe("string");
          expect(typeof option.multiplier).toBe("number");
          
          // Validate that value is a valid Frequency
          expect(isValidFrequency(option.value)).toBe(true);
        });
      });
    });

    it("should have correct number of options", () => {
      const options = getFrequencyOptions();
      expect(options).toHaveLength(5); // 5 frequencies defined
    });

    it("should use different multipliers for precise vs legacy", () => {
      const preciseOptions = getFrequencyOptions(true);
      const legacyOptions = getFrequencyOptions(false);
      
      const preciseWeekly = preciseOptions.find(opt => opt.value === "weekly");
      const legacyWeekly = legacyOptions.find(opt => opt.value === "weekly");
      
      expect(preciseWeekly?.multiplier).toBe(52.1775);
      expect(legacyWeekly?.multiplier).toBe(52);
    });
  });

  describe("getFrequencyDisplayText - Type Safety", () => {
    it("should handle all defined frequency types", () => {
      const testCases: Array<[string, number, string]> = [
        ["weekly", 1, "Weekly"],
        ["biweekly", 1, "Bi-weekly"],
        ["monthly", 1, "Monthly"],
        ["quarterly", 1, "Quarterly"],
        ["yearly", 1, "Annual"],
        ["annual", 1, "Annual"],
        ["once", 1, "One-time"],
      ];

      testCases.forEach(([freq, custom, expected]) => {
        const result = getFrequencyDisplayText(freq, custom);
        expect(result).toBe(expected);
      });
    });

    it("should handle custom frequency multipliers", () => {
      const testCases: Array<[string, number, string]> = [
        ["monthly", 3, "Every 3 months"],
        ["weekly", 2, "Every 2 weeks"],
        ["yearly", 5, "Every 5 years"],
        ["quarterly", 2, "Quarterly (2x)"], // Non-standard custom handling
      ];

      testCases.forEach(([freq, custom, expected]) => {
        const result = getFrequencyDisplayText(freq, custom);
        expect(result).toBe(expected);
      });
    });

    it("should handle edge cases", () => {
      expect(getFrequencyDisplayText("")).toBe("Not set");
      expect(getFrequencyDisplayText("unknown")).toBe("unknown");
      expect(getFrequencyDisplayText("monthly", 0)).toBe("Monthly"); // 0 treated as 1
      expect(getFrequencyDisplayText("monthly", 1)).toBe("Monthly");
    });
  });

  describe("Mathematical Accuracy", () => {
    it("should maintain mathematical consistency across conversions", () => {
      const originalAmount = 1200;
      
      // Convert yearly -> monthly -> yearly should return original
      const monthlyAmount = convertFrequency(originalAmount, "yearly", "monthly");
      const backToYearly = convertFrequency(monthlyAmount, "monthly", "yearly");
      
      expect(backToYearly).toBeCloseTo(originalAmount, 10);
    });

    it("should handle precision in weekly calculations", () => {
      const yearlyAmount = 52.1775; // Exactly one dollar per precise week
      const weeklyAmount = convertFrequency(yearlyAmount, "yearly", "weekly", true);
      
      expect(weeklyAmount).toBeCloseTo(1, 10);
    });

    it("should demonstrate precision difference", () => {
      const weeklyAmount = 100;
      
      const preciseYearly = convertFrequency(weeklyAmount, "weekly", "yearly", true);
      const legacyYearly = convertFrequency(weeklyAmount, "weekly", "yearly", false);
      
      expect(preciseYearly).toBe(5217.75);
      expect(legacyYearly).toBe(5200);
      expect(preciseYearly - legacyYearly).toBe(17.75);
    });
  });
});