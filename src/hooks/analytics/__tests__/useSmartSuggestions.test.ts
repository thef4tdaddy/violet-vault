import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSmartSuggestions } from "@/hooks/analytics/useSmartSuggestions";

const buildUncategorizedTransactions = () => {
  const baseDate = new Date();

  const createEntry = (merchant: string, descriptionSuffix: string, daysAgo: number, amount: number) => {
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
    } as Record<string, unknown>;
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
  it("returns transaction category suggestions for merchant clusters", () => {
    const transactions = buildUncategorizedTransactions();

    const { result } = renderHook(() => useSmartSuggestions({ transactions, bills: [] }));

    const starbucksSuggestion = result.current.suggestTransactionCategory("Starbucks Coffee Store 512");
    expect(starbucksSuggestion).not.toBeNull();
    expect(starbucksSuggestion?.category).toBe("Food & Dining");
    expect(starbucksSuggestion?.source).toBeDefined();

    const unknownSuggestion = result.current.suggestTransactionCategory("Random Merchant");
    expect(unknownSuggestion).toBeNull();
  });

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
});

