import { renderHook } from "@testing-library/react";
import { useSmartCategoryAnalysis } from "../useSmartCategoryAnalysis";

const mockTransactions = [
  {
    id: 1,
    date: "2024-01-15",
    description: "Amazon Purchase",
    amount: -50,
    category: "",
  },
  {
    id: 2,
    date: "2024-01-10",
    description: "Amazon Marketplace",
    amount: -25,
    category: "",
  },
  {
    id: 3,
    date: "2024-01-05",
    description: "Grocery Store",
    amount: -100,
    category: "Food",
  },
];

const mockBills = [
  {
    id: 1,
    name: "Electric Bill",
    amount: 120,
    category: "",
  },
  {
    id: 2,
    name: "Netflix Subscription",
    amount: 15,
    category: "",
  },
];

describe("useSmartCategoryAnalysis", () => {
  it("should analyze transaction patterns correctly", () => {
    const { result } = renderHook(() =>
      useSmartCategoryAnalysis(mockTransactions, mockBills, "30", {
        minTransactionCount: 2,
        minAmount: 20,
      }),
    );

    expect(result.current.transactionAnalysis).toBeDefined();
    expect(Array.isArray(result.current.transactionAnalysis)).toBe(true);

    // Should suggest categorizing Amazon transactions
    const amazonSuggestion = result.current.transactionAnalysis.find(
      (suggestion) => suggestion.id === "transaction_amazon",
    );
    expect(amazonSuggestion).toBeDefined();
    expect(amazonSuggestion?.affectedTransactions).toBe(2);
  });

  it("should analyze bill patterns correctly", () => {
    const { result } = renderHook(() =>
      useSmartCategoryAnalysis(mockTransactions, mockBills, "30"),
    );

    expect(result.current.billAnalysis).toBeDefined();
    expect(Array.isArray(result.current.billAnalysis)).toBe(true);

    // Should suggest utility categories for electric bill
    const utilitySuggestion = result.current.billAnalysis.find(
      (suggestion) => suggestion.suggestedCategory === "Utilities",
    );
    expect(utilitySuggestion).toBeDefined();
  });

  it("should filter transactions by date range correctly", () => {
    const oldTransaction = {
      id: 4,
      date: "2020-01-01",
      description: "Old Purchase",
      amount: -30,
      category: "",
    };

    const { result } = renderHook(() =>
      useSmartCategoryAnalysis(
        [...mockTransactions, oldTransaction],
        mockBills,
        "30",
      ),
    );

    // Old transaction should be filtered out
    expect(result.current.filteredTransactions).toHaveLength(3);
    expect(
      result.current.filteredTransactions.find((t) => t.id === 4),
    ).toBeUndefined();
  });

  it("should extract merchant names correctly", () => {
    const { result } = renderHook(() =>
      useSmartCategoryAnalysis(mockTransactions, mockBills),
    );

    const merchantName = result.current.extractMerchantName(
      "Amazon Purchase #12345",
    );
    expect(merchantName).toBe("amazon purchase");
  });

  it("should suggest bill categories correctly", () => {
    const { result } = renderHook(() =>
      useSmartCategoryAnalysis(mockTransactions, mockBills),
    );

    expect(result.current.suggestBillCategory("Electric Power Company")).toBe(
      "Utilities",
    );
    expect(
      result.current.suggestBillCategory("Internet Service Provider"),
    ).toBe("Communications");
    expect(result.current.suggestBillCategory("Netflix Streaming")).toBe(
      "Entertainment",
    );
    expect(result.current.suggestBillCategory("Unknown Bill")).toBeNull();
  });

  it("should handle empty data gracefully", () => {
    const { result } = renderHook(() => useSmartCategoryAnalysis([], [], "30"));

    expect(result.current.filteredTransactions).toHaveLength(0);
    expect(result.current.transactionAnalysis).toHaveLength(0);
    expect(result.current.billAnalysis).toHaveLength(0);
  });

  it("should respect analysis settings", () => {
    const { result } = renderHook(() =>
      useSmartCategoryAnalysis(mockTransactions, mockBills, "30", {
        minTransactionCount: 10, // Very high threshold
        minAmount: 1000,
      }),
    );

    // With high thresholds, no suggestions should be generated
    expect(result.current.transactionAnalysis).toHaveLength(0);
  });
});
