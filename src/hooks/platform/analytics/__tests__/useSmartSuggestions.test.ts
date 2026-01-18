import { describe, expect, it, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSmartSuggestions } from "@/hooks/platform/analytics/useSmartSuggestions";
import type { TransactionForStats } from "@/utils/features/analytics/categoryHelpers";

const buildUncategorizedTransactions = (): TransactionForStats[] => {
  const baseDate = new Date();

  const createEntry = (
    merchant: string,
    descriptionSuffix: string,
    daysAgo: number,
    amount: number
  ): TransactionForStats => {
    const entryDate = new Date(baseDate);
    entryDate.setDate(entryDate.getDate() - daysAgo);

    return {
      id: `${merchant.replace(/\s+/g, "-").toLowerCase()}-${daysAgo}`,
      date: entryDate.toISOString().split("T")[0],
      amount: -Math.abs(amount),
      envelopeId: "",
      category: "",
      type: "expense",
      description: `${merchant} ${descriptionSuffix}`,
      merchant,
    } as TransactionForStats;
  };

  return [
    createEntry("Starbucks Coffee", "Store 512", 4, 12.45),
    createEntry("Starbucks Coffee", "Store 512", 10, 11.25),
    createEntry("Starbucks Coffee", "Store 610", 16, 13.1),
    createEntry("Starbucks Coffee", "Store 412", 22, 9.8),
    createEntry("Starbucks Coffee", "Store 412", 28, 10.9),
    createEntry("Amazon Marketplace", "Order 123-987", 5, 64.55),
    createEntry("Amazon Marketplace", "Order 123-654", 12, 52.35),
    createEntry("Amazon Marketplace", "Order 123-321", 18, 71.8),
    createEntry("Amazon Marketplace", "Order 123-456", 24, 58.25),
    createEntry("Amazon Marketplace", "Order 123-777", 30, 67.4),
  ];
};

describe("useSmartSuggestions", () => {
  let transactions: TransactionForStats[];

  beforeEach(() => {
    transactions = buildUncategorizedTransactions();
  });

  describe("initialization", () => {
    it("should initialize with empty transactions and bills", () => {
      const { result } = renderHook(() => useSmartSuggestions());

      expect(result.current.suggestTransactionCategory).toBeDefined();
      expect(result.current.suggestBillDetails).toBeDefined();
    });

    it("should initialize with provided transactions and bills", () => {
      const bills = [{ id: "1", name: "Electric Bill" }];
      const { result } = renderHook(() => useSmartSuggestions({ transactions, bills }));

      expect(result.current.suggestTransactionCategory).toBeDefined();
      expect(result.current.suggestBillDetails).toBeDefined();
    });
  });

  describe("suggestTransactionCategory", () => {
    it("returns transaction category suggestions for merchant clusters", () => {
      const { result } = renderHook(() => useSmartSuggestions({ transactions, bills: [] }));

      const starbucksSuggestion = result.current.suggestTransactionCategory(
        "Starbucks Coffee Store 512"
      );
      expect(starbucksSuggestion).not.toBeNull();
      expect(starbucksSuggestion?.category).toBe("Food & Dining");
      expect(starbucksSuggestion?.source).toBeDefined();

      const unknownSuggestion = result.current.suggestTransactionCategory("Random Merchant");
      expect(unknownSuggestion).toBeNull();
    });

    it("should return null for empty description", () => {
      const { result } = renderHook(() => useSmartSuggestions());

      expect(result.current.suggestTransactionCategory(null)).toBeNull();
      expect(result.current.suggestTransactionCategory(undefined)).toBeNull();
      expect(result.current.suggestTransactionCategory("")).toBeNull();
    });

    it("should handle Amazon marketplace transactions", () => {
      const { result } = renderHook(() => useSmartSuggestions({ transactions, bills: [] }));

      const amazonSuggestion = result.current.suggestTransactionCategory(
        "Amazon Marketplace Order 123-987"
      );
      expect(amazonSuggestion).not.toBeNull();
      expect(amazonSuggestion?.merchant).toBeTruthy();
      expect(amazonSuggestion?.category).toBeTruthy();
    });

    it("should provide confidence scores", () => {
      const { result } = renderHook(() => useSmartSuggestions({ transactions, bills: [] }));

      const suggestion = result.current.suggestTransactionCategory("Starbucks Coffee");
      expect(suggestion?.confidence).toBeGreaterThan(0);
      expect(suggestion?.confidence).toBeLessThanOrEqual(1);
    });

    it("should identify source of suggestion", () => {
      const { result } = renderHook(() => useSmartSuggestions({ transactions, bills: [] }));

      const suggestion = result.current.suggestTransactionCategory("Starbucks Coffee");
      expect(suggestion?.source).toMatch(/^(analysis|pattern)$/);
    });
  });

  describe("suggestBillDetails", () => {
    it("provides bill category and icon suggestions for fuzzy provider names", () => {
      const { result } = renderHook(() => useSmartSuggestions({ transactions: [], bills: [] }));

      const suggestion = result.current.suggestBillDetails(
        "Brightstream Broadband Statement",
        "Auto-pay invoice",
        ""
      );

      expect(suggestion).not.toBeNull();
      expect(suggestion?.category).toBeTruthy();
      expect(suggestion?.iconSuggestions.length).toBeGreaterThan(0);
      expect(suggestion?.iconName).toBeTruthy();
    });

    it("should return null for empty name", () => {
      const { result } = renderHook(() => useSmartSuggestions());

      expect(result.current.suggestBillDetails(null, null)).toBeNull();
      expect(result.current.suggestBillDetails(undefined, null)).toBeNull();
      expect(result.current.suggestBillDetails("", null)).toBeNull();
      expect(result.current.suggestBillDetails("   ", null)).toBeNull();
    });

    it("should use current category if provided", () => {
      const { result } = renderHook(() => useSmartSuggestions());
      const suggestion = result.current.suggestBillDetails("Test Bill", null, "Housing");

      expect(suggestion?.category).toBe("Housing");
    });

    it("should provide icon suggestions array", () => {
      const { result } = renderHook(() => useSmartSuggestions());
      const suggestion = result.current.suggestBillDetails("Electric Bill", null);

      expect(suggestion?.iconSuggestions).toBeDefined();
      expect(Array.isArray(suggestion?.iconSuggestions)).toBe(true);
    });

    it("should include confidence scores", () => {
      const { result } = renderHook(() => useSmartSuggestions());
      const suggestion = result.current.suggestBillDetails("Netflix Subscription", null);

      expect(suggestion?.confidence).toBeGreaterThan(0);
      expect(suggestion?.confidence).toBeLessThanOrEqual(1);
    });

    it("should identify source of suggestion", () => {
      const { result } = renderHook(() => useSmartSuggestions());
      const suggestion = result.current.suggestBillDetails("Electric Company", null);

      expect(suggestion?.source).toMatch(/^(analysis|pattern|fallback)$/);
    });

    it("should trim whitespace from bill name", () => {
      const { result } = renderHook(() => useSmartSuggestions());
      const suggestion1 = result.current.suggestBillDetails("  Netflix  ", null);
      const suggestion2 = result.current.suggestBillDetails("Netflix", null);

      expect(suggestion1?.category).toBe(suggestion2?.category);
    });

    it("should handle notes parameter", () => {
      const { result } = renderHook(() => useSmartSuggestions());
      const suggestion = result.current.suggestBillDetails(
        "Monthly Service",
        "Streaming subscription"
      );

      expect(suggestion).not.toBeNull();
      expect(suggestion?.category).toBeTruthy();
    });

    it("should provide icon name", () => {
      const { result } = renderHook(() => useSmartSuggestions());
      const suggestion = result.current.suggestBillDetails("Test Bill", null);

      expect(suggestion?.iconName).toBeTruthy();
      expect(typeof suggestion?.iconName).toBe("string");
    });
  });

  describe("edge cases", () => {
    it("should handle empty transactions array", () => {
      const { result } = renderHook(() => useSmartSuggestions({ transactions: [], bills: [] }));

      result.current.suggestTransactionCategory("Test Merchant");
      // Should still work with pattern matching
      expect(result.current.suggestTransactionCategory).toBeDefined();
    });

    it("should handle undefined options", () => {
      const { result } = renderHook(() => useSmartSuggestions(undefined));

      expect(result.current.suggestTransactionCategory).toBeDefined();
      expect(result.current.suggestBillDetails).toBeDefined();
    });

    it("should handle special characters in merchant names", () => {
      const { result } = renderHook(() => useSmartSuggestions({ transactions, bills: [] }));

      result.current.suggestTransactionCategory("Café & Restaurant");
      // Should not crash
      expect(result.current.suggestTransactionCategory).toBeDefined();
    });

    it("should handle very long bill names", () => {
      const { result } = renderHook(() => useSmartSuggestions());
      const longName = "A".repeat(200);

      const suggestion = result.current.suggestBillDetails(longName, null);
      expect(suggestion).not.toBeNull();
    });
  });

  describe("consistency", () => {
    it("should return consistent results for same input", () => {
      const { result } = renderHook(() => useSmartSuggestions({ transactions, bills: [] }));

      const suggestion1 = result.current.suggestTransactionCategory("Starbucks Coffee");
      const suggestion2 = result.current.suggestTransactionCategory("Starbucks Coffee");

      expect(suggestion1?.category).toBe(suggestion2?.category);
      expect(suggestion1?.confidence).toBe(suggestion2?.confidence);
    });

    it("should provide stable bill suggestions", () => {
      const { result } = renderHook(() => useSmartSuggestions());

      const suggestion1 = result.current.suggestBillDetails("Netflix", null);
      const suggestion2 = result.current.suggestBillDetails("Netflix", null);

      expect(suggestion1?.category).toBe(suggestion2?.category);
      expect(suggestion1?.iconName).toBe(suggestion2?.iconName);
    });
  });
});
