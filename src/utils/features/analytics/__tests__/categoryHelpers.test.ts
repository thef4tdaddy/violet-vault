import { describe, it, expect, vi } from "vitest";
import {
  calculateCategoryStats,
  processSuggestions,
  applySuggestionToData,
  formatCurrency,
  formatFrequency,
  getFrequencyCategory,
  calculateSuggestionImpact,
  validateCategoryName,
  generateSuggestionId,
  type CategoryStat,
  type Suggestion,
  type TransactionForStats,
} from "../categoryHelpers";

describe("categoryHelpers", () => {
  describe("calculateCategoryStats", () => {
    it("should calculate stats for single category", () => {
      const transactions: TransactionForStats[] = [
        { id: "1", category: "Food", amount: 50, date: "2024-01-15" },
        { id: "2", category: "Food", amount: 30, date: "2024-01-16" },
      ];

      const stats = calculateCategoryStats(transactions);

      expect(stats).toHaveLength(1);
      expect(stats[0].name).toBe("Food");
      expect(stats[0].transactionCount).toBe(2);
      expect(stats[0].totalAmount).toBe(80);
      expect(stats[0].avgAmount).toBe(40);
    });

    it("should calculate stats for multiple categories", () => {
      const transactions: TransactionForStats[] = [
        { id: "1", category: "Food", amount: 100, date: "2024-01-15" },
        { id: "2", category: "Transport", amount: 50, date: "2024-01-16" },
        { id: "3", category: "Food", amount: 75, date: "2024-01-17" },
      ];

      const stats = calculateCategoryStats(transactions);

      expect(stats).toHaveLength(2);
      expect(stats[0].name).toBe("Food"); // Sorted by totalAmount
      expect(stats[0].totalAmount).toBe(175);
      expect(stats[1].name).toBe("Transport");
      expect(stats[1].totalAmount).toBe(50);
    });

    it("should handle uncategorized transactions", () => {
      const transactions: TransactionForStats[] = [
        { id: "1", amount: 50, date: "2024-01-15" },
        { id: "2", category: "", amount: 30, date: "2024-01-16" },
      ];

      const stats = calculateCategoryStats(transactions);

      expect(stats).toHaveLength(1);
      expect(stats[0].name).toBe("Uncategorized");
      expect(stats[0].totalAmount).toBe(80);
    });

    it("should use absolute values for amounts", () => {
      const transactions: TransactionForStats[] = [
        { id: "1", category: "Food", amount: -50, date: "2024-01-15" },
        { id: "2", category: "Food", amount: -30, date: "2024-01-16" },
      ];

      const stats = calculateCategoryStats(transactions);

      expect(stats[0].totalAmount).toBe(80);
      expect(stats[0].avgAmount).toBe(40);
    });

    it("should track last used date correctly", () => {
      const transactions: TransactionForStats[] = [
        { id: "1", category: "Food", amount: 50, date: "2024-01-10" },
        { id: "2", category: "Food", amount: 30, date: "2024-01-20" },
        { id: "3", category: "Food", amount: 40, date: "2024-01-15" },
      ];

      const stats = calculateCategoryStats(transactions);

      expect(stats[0].lastUsed).toEqual(new Date("2024-01-20"));
    });

    it("should calculate frequency based on last used date", () => {
      const transactions: TransactionForStats[] = [
        { id: "1", category: "Food", amount: 50, date: "2024-01-15" },
        { id: "2", category: "Food", amount: 30, date: "2024-01-16" },
      ];

      const stats = calculateCategoryStats(transactions);

      expect(stats[0].frequency).toBeGreaterThan(0);
    });

    it("should handle empty transaction list", () => {
      const stats = calculateCategoryStats([]);

      expect(stats).toHaveLength(0);
    });

    it("should sort categories by total amount descending", () => {
      const transactions: TransactionForStats[] = [
        { id: "1", category: "A", amount: 50, date: "2024-01-15" },
        { id: "2", category: "B", amount: 200, date: "2024-01-16" },
        { id: "3", category: "C", amount: 100, date: "2024-01-17" },
      ];

      const stats = calculateCategoryStats(transactions);

      expect(stats[0].name).toBe("B");
      expect(stats[1].name).toBe("C");
      expect(stats[2].name).toBe("A");
    });
  });

  describe("processSuggestions", () => {
    const createSuggestion = (
      id: string,
      priority: "high" | "medium" | "low",
      impact: number
    ): Suggestion => ({
      id,
      priority,
      impact,
      category: "transactions",
      type: "test",
      suggestedAmount: 100,
      reasoning: "test reasoning",
    });

    it("should combine transaction and bill suggestions", () => {
      const transactionSuggestions = [createSuggestion("t1", "high", 100)];
      const billSuggestions = [createSuggestion("b1", "medium", 50)];

      const result = processSuggestions(transactionSuggestions, billSuggestions, new Set());

      expect(result).toHaveLength(2);
    });

    it("should filter out dismissed suggestions", () => {
      const suggestions = [
        createSuggestion("s1", "high", 100),
        createSuggestion("s2", "medium", 50),
        createSuggestion("s3", "low", 25),
      ];

      const dismissed = new Set(["s2"]);
      const result = processSuggestions(suggestions, [], dismissed);

      expect(result).toHaveLength(2);
      expect(result.find((s) => s.id === "s2")).toBeUndefined();
    });

    it("should sort by priority first, then by impact", () => {
      const suggestions = [
        createSuggestion("s1", "low", 100),
        createSuggestion("s2", "high", 50),
        createSuggestion("s3", "medium", 75),
        createSuggestion("s4", "high", 80),
      ];

      const result = processSuggestions(suggestions, [], new Set());

      expect(result[0].id).toBe("s4"); // high priority, 80 impact
      expect(result[1].id).toBe("s2"); // high priority, 50 impact
      expect(result[2].id).toBe("s3"); // medium priority
      expect(result[3].id).toBe("s1"); // low priority
    });

    it("should limit results to maxResults", () => {
      const suggestions = Array.from({ length: 20 }, (_, i) =>
        createSuggestion(`s${i}`, "medium", i)
      );

      const result = processSuggestions(suggestions, [], new Set(), 5);

      expect(result).toHaveLength(5);
    });

    it("should default to 12 results when maxResults not specified", () => {
      const suggestions = Array.from({ length: 20 }, (_, i) =>
        createSuggestion(`s${i}`, "medium", i)
      );

      const result = processSuggestions(suggestions, [], new Set());

      expect(result).toHaveLength(12);
    });
  });

  describe("applySuggestionToData", () => {
    it("should call onApplyToTransactions for transaction suggestions", async () => {
      const suggestion: Suggestion = {
        id: "s1",
        priority: "high",
        impact: 100,
        category: "transactions",
        type: "test",
        suggestedAmount: 100,
        reasoning: "test",
      };

      const onApplyToTransactions = vi.fn().mockResolvedValue(undefined);
      const result = await applySuggestionToData(suggestion, onApplyToTransactions);

      expect(result).toBe(true);
      expect(onApplyToTransactions).toHaveBeenCalledWith(suggestion);
    });

    it("should call onApplyToBills for bill suggestions", async () => {
      const suggestion: Suggestion = {
        id: "s1",
        priority: "high",
        impact: 100,
        category: "bills",
        type: "test",
        suggestedAmount: 100,
        reasoning: "test",
      };

      const onApplyToBills = vi.fn().mockResolvedValue(undefined);
      const result = await applySuggestionToData(suggestion, undefined, onApplyToBills);

      expect(result).toBe(true);
      expect(onApplyToBills).toHaveBeenCalledWith(suggestion);
    });

    it("should return true when no handler is provided but category doesn't match", async () => {
      const suggestion: Suggestion = {
        id: "s1",
        priority: "high",
        impact: 100,
        category: "other",
        type: "test",
        suggestedAmount: 100,
        reasoning: "test",
      };

      const result = await applySuggestionToData(suggestion);

      expect(result).toBe(true);
    });

    it("should return false when handler throws error", async () => {
      const suggestion: Suggestion = {
        id: "s1",
        priority: "high",
        impact: 100,
        category: "transactions",
        type: "test",
        suggestedAmount: 100,
        reasoning: "test",
      };

      const onApplyToTransactions = vi.fn().mockRejectedValue(new Error("test error"));
      const result = await applySuggestionToData(suggestion, onApplyToTransactions);

      expect(result).toBe(false);
    });
  });

  describe("formatCurrency", () => {
    it("should format positive numbers", () => {
      expect(formatCurrency(1234)).toBe("$1,234");
      expect(formatCurrency(1234.56)).toBe("$1,234.56");
    });

    it("should format zero", () => {
      expect(formatCurrency(0)).toBe("$0");
    });

    it("should format negative numbers with negative sign", () => {
      expect(formatCurrency(-1234)).toBe("$-1,234");
      expect(formatCurrency(-1234.56)).toBe("$-1,234.56");
    });

    it("should handle null and undefined", () => {
      expect(formatCurrency(null)).toBe("$0");
      expect(formatCurrency(undefined)).toBe("$0");
    });

    it("should handle NaN", () => {
      expect(formatCurrency(NaN)).toBe("$0");
    });

    it("should round to 2 decimal places or omit if whole number", () => {
      expect(formatCurrency(1234.1)).toBe("$1,234.1");
      expect(formatCurrency(1234.999)).toBe("$1,235");
    });

    it("should add commas for large numbers", () => {
      expect(formatCurrency(1234567)).toBe("$1,234,567");
      expect(formatCurrency(1234567.89)).toBe("$1,234,567.89");
    });
  });

  describe("formatFrequency", () => {
    it("should format high frequency per month", () => {
      expect(formatFrequency(5.2)).toBe("5.2/month");
      expect(formatFrequency(1.0)).toBe("1.0/month");
    });

    it("should format medium frequency per year", () => {
      expect(formatFrequency(0.5)).toBe("6.0/year");
      expect(formatFrequency(0.1)).toBe("1.2/year");
    });

    it("should format low frequency as rarely used", () => {
      expect(formatFrequency(0.05)).toBe("Rarely used");
      expect(formatFrequency(0.01)).toBe("Rarely used");
    });

    it("should handle edge cases", () => {
      expect(formatFrequency(0)).toBe("Rarely used");
      expect(formatFrequency(10)).toBe("10.0/month");
    });
  });

  describe("getFrequencyCategory", () => {
    it("should return high for frequency > 2", () => {
      expect(getFrequencyCategory(2.1)).toBe("high");
      expect(getFrequencyCategory(10)).toBe("high");
    });

    it("should return low for frequency < 0.5", () => {
      expect(getFrequencyCategory(0.4)).toBe("low");
      expect(getFrequencyCategory(0.1)).toBe("low");
    });

    it("should return medium for frequency between 0.5 and 2", () => {
      expect(getFrequencyCategory(0.5)).toBe("medium");
      expect(getFrequencyCategory(1.0)).toBe("medium");
      expect(getFrequencyCategory(2.0)).toBe("medium");
    });
  });

  describe("calculateSuggestionImpact", () => {
    it("should calculate impact based on total amount", () => {
      const suggestion: Suggestion = {
        id: "s1",
        priority: "medium",
        impact: 0,
        category: "transactions",
        type: "test",
        suggestedAmount: 100,
        reasoning: "test",
        data: { totalAmount: 1000 },
      };

      const impact = calculateSuggestionImpact(suggestion);

      expect(impact).toBeGreaterThan(0);
    });

    it("should calculate impact based on transaction count", () => {
      const suggestion: Suggestion = {
        id: "s1",
        priority: "medium",
        impact: 0,
        category: "transactions",
        type: "test",
        suggestedAmount: 100,
        reasoning: "test",
        data: { transactionCount: 10 },
      };

      const impact = calculateSuggestionImpact(suggestion);

      expect(impact).toBeGreaterThan(0);
    });

    it("should apply priority multiplier", () => {
      const baseSuggestion: Omit<Suggestion, "priority"> = {
        id: "s1",
        impact: 0,
        category: "transactions",
        type: "test",
        suggestedAmount: 100,
        reasoning: "test",
        data: { totalAmount: 100 },
      };

      const highPriority = calculateSuggestionImpact({
        ...baseSuggestion,
        priority: "high",
      });
      const mediumPriority = calculateSuggestionImpact({
        ...baseSuggestion,
        priority: "medium",
      });
      const lowPriority = calculateSuggestionImpact({
        ...baseSuggestion,
        priority: "low",
      });

      expect(highPriority).toBeGreaterThan(mediumPriority);
      expect(mediumPriority).toBeGreaterThan(lowPriority);
    });

    it("should handle missing data", () => {
      const suggestion: Suggestion = {
        id: "s1",
        priority: "medium",
        impact: 0,
        category: "transactions",
        type: "test",
        suggestedAmount: 100,
        reasoning: "test",
      };

      const impact = calculateSuggestionImpact(suggestion);

      expect(impact).toBe(0);
    });

    it("should round to 1 decimal place", () => {
      const suggestion: Suggestion = {
        id: "s1",
        priority: "medium",
        impact: 0,
        category: "transactions",
        type: "test",
        suggestedAmount: 100,
        reasoning: "test",
        data: { totalAmount: 123, transactionCount: 7 },
      };

      const impact = calculateSuggestionImpact(suggestion);

      // Verify the result has at most 1 decimal place
      const impactString = impact.toString();
      const decimalIndex = impactString.indexOf(".");
      if (decimalIndex !== -1) {
        const decimalPlaces = impactString.length - decimalIndex - 1;
        expect(decimalPlaces).toBeLessThanOrEqual(1);
      }

      // Also verify it matches the expected calculation
      const expectedImpact = (123 * 0.1 + 7 * 0.5) * 2;
      expect(impact).toBe(Math.round(expectedImpact * 10) / 10);
    });
  });

  describe("validateCategoryName", () => {
    it("should validate correct category names", () => {
      const result1 = validateCategoryName("Food");
      expect(result1.isValid).toBe(true);
      expect(result1.errors).toHaveLength(0);

      const result2 = validateCategoryName("Food_Groceries");
      expect(result2.isValid).toBe(true);

      const result3 = validateCategoryName("Food-Items");
      expect(result3.isValid).toBe(true);

      const result4 = validateCategoryName("Food 123");
      expect(result4.isValid).toBe(true);
    });

    it("should reject empty names", () => {
      const result1 = validateCategoryName("");
      expect(result1.isValid).toBe(false);
      expect(result1.errors).toContain("Category name is required");

      const result2 = validateCategoryName("   ");
      expect(result2.isValid).toBe(false);
      expect(result2.errors).toContain("Category name is required");
    });

    it("should reject names longer than 50 characters", () => {
      const longName = "a".repeat(51);
      const result = validateCategoryName(longName);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Category name must be 50 characters or less");
    });

    it("should reject names with invalid characters", () => {
      const result1 = validateCategoryName("Food@Store");
      expect(result1.isValid).toBe(false);
      expect(result1.errors).toContain(
        "Category name can only contain letters, numbers, spaces, hyphens, and underscores"
      );

      const result2 = validateCategoryName("Food#123");
      expect(result2.isValid).toBe(false);

      const result3 = validateCategoryName("Food$");
      expect(result3.isValid).toBe(false);
    });

    it("should allow names at exactly 50 characters", () => {
      const name = "a".repeat(50);
      const result = validateCategoryName(name);

      expect(result.isValid).toBe(true);
    });
  });

  describe("generateSuggestionId", () => {
    it("should generate consistent format", () => {
      const id = generateSuggestionId("create", "Food Items", "category");

      expect(id).toMatch(/^create_food_items_category_\d+$/);
    });

    it("should include timestamp", () => {
      const before = Date.now();
      const id = generateSuggestionId("create", "Food", "category");
      const after = Date.now();

      const timestamp = parseInt(id.split("_").pop() || "0");
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    it("should convert category name to lowercase with underscores", () => {
      const id1 = generateSuggestionId("create", "Food Items", "category");
      expect(id1).toContain("food_items");

      const id2 = generateSuggestionId("create", "Multiple   Spaces", "category");
      expect(id2).toContain("multiple_spaces");
    });

    it("should handle special characters in category name", () => {
      const id = generateSuggestionId("create", "Food-Items & More", "category");
      expect(id).toContain("food-items_&_more");
    });
  });
});
