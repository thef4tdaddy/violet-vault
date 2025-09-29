/**
 * TypeScript-driven tests for performanceUtils
 * Testing edge cases and type safety revealed by TypeScript conversion
 */
import { describe, it, expect } from "vitest";
import {
  getScoreColor,
  getScoreBgColor,
  getPerformanceMessage,
  getAlertIconType,
  getRecommendationIconType,
  type PerformanceScore,
  type AlertType,
  type RecommendationType,
} from "../performanceUtils";

describe("performanceUtils - Type Safety & Edge Cases", () => {
  describe("getScoreColor", () => {
    it("should handle exact boundary values", () => {
      expect(getScoreColor(90)).toBe("text-green-600 bg-green-100");
      expect(getScoreColor(70)).toBe("text-blue-600 bg-blue-100");
      expect(getScoreColor(50)).toBe("text-yellow-600 bg-yellow-100");
      expect(getScoreColor(49.99)).toBe("text-red-600 bg-red-100");
    });

    it("should handle edge case numeric values", () => {
      expect(getScoreColor(0)).toBe("text-red-600 bg-red-100");
      expect(getScoreColor(100)).toBe("text-green-600 bg-green-100");
      expect(getScoreColor(-10)).toBe("text-red-600 bg-red-100");
      expect(getScoreColor(150)).toBe("text-green-600 bg-green-100");
    });

    it("should handle floating point precision", () => {
      expect(getScoreColor(89.999999)).toBe("text-blue-600 bg-blue-100");
      expect(getScoreColor(90.000001)).toBe("text-green-600 bg-green-100");
    });
  });

  describe("getScoreBgColor", () => {
    it("should handle exact boundary values", () => {
      expect(getScoreBgColor(90)).toBe("bg-green-500");
      expect(getScoreBgColor(70)).toBe("bg-blue-500");
      expect(getScoreBgColor(50)).toBe("bg-yellow-500");
      expect(getScoreBgColor(49)).toBe("bg-red-500");
    });

    it("should handle extreme values", () => {
      expect(getScoreBgColor(Number.MAX_SAFE_INTEGER)).toBe("bg-green-500");
      expect(getScoreBgColor(Number.MIN_SAFE_INTEGER)).toBe("bg-red-500");
    });
  });

  describe("getPerformanceMessage", () => {
    it("should return appropriate messages for score ranges", () => {
      expect(getPerformanceMessage(95)).toContain("Excellent financial management");
      expect(getPerformanceMessage(75)).toContain("Good financial health");
      expect(getPerformanceMessage(55)).toContain("Fair financial standing");
      expect(getPerformanceMessage(25)).toContain("needs immediate attention");
    });

    it("should handle boundary edge cases", () => {
      expect(getPerformanceMessage(90)).toContain("Excellent");
      expect(getPerformanceMessage(89.99)).toContain("Good");
      expect(getPerformanceMessage(70)).toContain("Good");
      expect(getPerformanceMessage(69.99)).toContain("Fair");
    });
  });

  describe("getAlertIconType - Type Safety", () => {
    it("should handle all valid AlertType values", () => {
      const validTypes: AlertType[] = ["error", "warning", "info", "success"];
      
      validTypes.forEach(type => {
        const result = getAlertIconType(type);
        expect(result).toHaveProperty("name");
        expect(result).toHaveProperty("color");
        expect(typeof result.name).toBe("string");
        expect(typeof result.color).toBe("string");
      });
    });

    it("should return consistent icon config structure", () => {
      const result = getAlertIconType("error");
      expect(result).toEqual({
        name: "AlertTriangle",
        color: "text-red-500"
      });
    });

    it("should handle default case for unknown types", () => {
      // TypeScript prevents this at compile time, but testing runtime behavior
      const result = getAlertIconType("unknown" as AlertType);
      expect(result).toEqual({
        name: "CheckCircle",
        color: "text-green-500"
      });
    });
  });

  describe("getRecommendationIconType - Type Safety", () => {
    it("should handle all valid RecommendationType values", () => {
      const validTypes: RecommendationType[] = ["success", "info", "warning", "tip"];
      
      validTypes.forEach(type => {
        const result = getRecommendationIconType(type);
        expect(result).toHaveProperty("name");
        expect(result).toHaveProperty("color");
        expect(typeof result.name).toBe("string");
        expect(typeof result.color).toBe("string");
      });
    });

    it("should return unique icons for different types", () => {
      const success = getRecommendationIconType("success");
      const info = getRecommendationIconType("info");
      const warning = getRecommendationIconType("warning");
      const tip = getRecommendationIconType("tip");

      expect(success.name).toBe("CheckCircle");
      expect(info.name).toBe("TrendingUp");
      expect(warning.name).toBe("AlertTriangle");
      expect(tip.name).toBe("Zap");
    });
  });

  describe("Type Constraints", () => {
    it("should enforce PerformanceScore as number type", () => {
      // These should compile without issues in TypeScript
      const validScores: PerformanceScore[] = [0, 50.5, 100, -10, 150];
      
      validScores.forEach(score => {
        expect(typeof getScoreColor(score)).toBe("string");
        expect(typeof getScoreBgColor(score)).toBe("string");
        expect(typeof getPerformanceMessage(score)).toBe("string");
      });
    });

    it("should enforce strict AlertType values", () => {
      // These should be valid AlertType values
      const validAlerts: AlertType[] = ["error", "warning", "info", "success"];
      
      validAlerts.forEach(type => {
        const result = getAlertIconType(type);
        expect(result.name).toBeTruthy();
        expect(result.color).toMatch(/^text-\w+-\d+$/);
      });
    });

    it("should enforce strict RecommendationType values", () => {
      // These should be valid RecommendationType values
      const validRecommendations: RecommendationType[] = ["success", "info", "warning", "tip"];
      
      validRecommendations.forEach(type => {
        const result = getRecommendationIconType(type);
        expect(result.name).toBeTruthy();
        expect(result.color).toMatch(/^text-\w+-\d+$/);
      });
    });
  });
});