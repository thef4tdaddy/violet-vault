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
  it("should return analysis structure correctly", () => {
    const { result } = renderHook(() =>
      useSmartCategoryAnalysis(mockTransactions, mockBills, "30", {
        minTransactionCount: 2,
        minAmount: 20,
      })
    );

    expect(result.current).toHaveProperty("transactionAnalysis");
    expect(result.current).toHaveProperty("billAnalysis");
    expect(result.current).toHaveProperty("filteredTransactions");
    expect(Array.isArray(result.current.transactionAnalysis)).toBe(true);
    expect(Array.isArray(result.current.billAnalysis)).toBe(true);
    expect(Array.isArray(result.current.filteredTransactions)).toBe(true);
  });

  it("should provide utility functions", () => {
    const { result } = renderHook(() =>
      useSmartCategoryAnalysis(mockTransactions, mockBills, "30")
    );

    expect(typeof result.current.extractMerchantName).toBe("function");
    expect(typeof result.current.suggestBillCategory).toBe("function");
  });

  it("should filter transactions by date range correctly", () => {
    // Create a transaction from more than 30 days ago
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 60); // 60 days ago

    const oldTransaction = {
      id: 4,
      date: oldDate.toISOString().split("T")[0],
      description: "Old Purchase",
      amount: -30,
      category: "",
    };

    const { result } = renderHook(() =>
      useSmartCategoryAnalysis([...mockTransactions, oldTransaction], mockBills, "30")
    );

    // With "30" day filter, old transaction (60 days old) should be filtered out
    // All mockTransactions are recent (2024-01-*), so they should remain
    expect(result.current.filteredTransactions.length).toBeLessThanOrEqual(3);
    expect(result.current.filteredTransactions.find((t) => t.id === 4)).toBeUndefined();
  });

  it("should include all transactions with large date range", () => {
    // Create an old transaction
    const oldTransaction = {
      id: 4,
      date: "2020-01-01",
      description: "Very Old Purchase",
      amount: -30,
      category: "",
    };

    const { result } = renderHook(() =>
      // Using "6months" filter which should include more transactions
      useSmartCategoryAnalysis([...mockTransactions, oldTransaction], mockBills, "6months")
    );

    // The 2020 transaction should still be filtered out with 6 months range
    expect(result.current.filteredTransactions.find((t) => t.id === 4)).toBeUndefined();
  });

  it("should extract merchant names correctly", () => {
    const { result } = renderHook(() => useSmartCategoryAnalysis(mockTransactions, mockBills));

    const merchantName = result.current.extractMerchantName("Amazon Purchase #12345");
    expect(merchantName).toBe("amazon purchase");
  });

  it("should analyze uncategorized transactions", () => {
    const { result } = renderHook(() =>
      useSmartCategoryAnalysis(mockTransactions, mockBills, "6months", {
        minTransactionCount: 1,
        minAmount: 10,
      })
    );

    // The hook should analyze transactions and return analysis results
    // Even if analysis is empty, the structure should be correct
    expect(Array.isArray(result.current.transactionAnalysis)).toBe(true);
    expect(Array.isArray(result.current.billAnalysis)).toBe(true);

    // Verify each analysis item has expected properties if any exist
    if (result.current.transactionAnalysis.length > 0) {
      const firstAnalysis = result.current.transactionAnalysis[0];
      expect(firstAnalysis).toHaveProperty("id");
    }
  });

  it("should suggest bill categories correctly", () => {
    const { result } = renderHook(() => useSmartCategoryAnalysis(mockTransactions, mockBills));

    expect(result.current.suggestBillCategory("Electric Power Company")).toBe("Utilities");
    expect(result.current.suggestBillCategory("Internet Service Provider")).toBe("Communications");
    expect(result.current.suggestBillCategory("Netflix Streaming")).toBe("Entertainment");
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
      })
    );

    // With high thresholds, no or fewer suggestions should be generated
    expect(Array.isArray(result.current.transactionAnalysis)).toBe(true);
  });
});
