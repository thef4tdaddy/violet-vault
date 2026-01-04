import {
  filterByDateRange,
  filterByEnvelope,
  filterByCategory,
  filterByType,
  filterBySearch,
  sortTransactions,
  processTransactions,
  groupTransactionsByDate,
  groupTransactionsByCategory,
  calculateTransactionStats,
} from "../filtering";
import logger from "@/utils/common/logger";

// Mock logger
vi.mock("@/utils/common/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

describe("filtering utilities", () => {
  const mockTransactions = [
    {
      id: "1",
      description: "Walmart Grocery Store",
      amount: -85.5,
      date: "2023-09-01",
      category: "Groceries",
      account: "Checking",
      envelopeId: "env1",
    },
    {
      id: "2",
      description: "Salary Deposit",
      amount: 2000.0,
      date: "2023-09-01",
      category: "Income",
      account: "Checking",
      envelopeId: "env2",
    },
    {
      id: "3",
      description: "Shell Gas Station",
      amount: -35.0,
      date: "2023-08-15",
      category: "Transportation",
      account: "Credit Card",
      envelopeId: "env3",
    },
    {
      id: "4",
      description: "Coffee Shop",
      amount: -4.5,
      date: "2023-09-02",
      category: "Dining",
      account: "Checking",
      envelopeId: "env1",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("filterByDateRange", () => {
    it("should return all transactions when no date range provided", () => {
      expect(filterByDateRange(mockTransactions)).toEqual(mockTransactions);
      expect(filterByDateRange(mockTransactions, {})).toEqual(mockTransactions);
      expect(filterByDateRange(mockTransactions, null)).toEqual(mockTransactions);
    });

    it("should filter by start date only", () => {
      const result = filterByDateRange(mockTransactions, {
        start: "2023-09-01",
      });
      expect(result).toHaveLength(3);
      expect(result.map((t) => t.id)).toEqual(["1", "2", "4"]);
    });

    it("should filter by end date only", () => {
      const result = filterByDateRange(mockTransactions, { end: "2023-09-01" });
      expect(result).toHaveLength(3);
      expect(result.map((t) => t.id)).toEqual(["1", "2", "3"]);
    });

    it("should filter by date range", () => {
      const result = filterByDateRange(mockTransactions, {
        start: "2023-08-20",
        end: "2023-09-01",
      });
      expect(result).toHaveLength(2);
      expect(result.map((t) => t.id)).toEqual(["1", "2"]);
    });

    it("should handle invalid dates gracefully", () => {
      // Invalid date strings result in Invalid Date objects but don't throw errors
      // They'll fail date comparisons and be included/excluded based on logic
      const result = filterByDateRange([{ ...mockTransactions[0], date: "invalid-date" }], {
        start: "2023-09-01",
      });
      // The transaction with invalid date gets included as it doesn't fail the comparison
      expect(result).toHaveLength(1);
    });

    it("should handle empty transactions array", () => {
      expect(filterByDateRange([], { start: "2023-09-01" })).toEqual([]);
    });
  });

  describe("filterByEnvelope", () => {
    it("should return all transactions when no envelope ID provided", () => {
      expect(filterByEnvelope(mockTransactions)).toEqual(mockTransactions);
      expect(filterByEnvelope(mockTransactions, "")).toEqual(mockTransactions);
      expect(filterByEnvelope(mockTransactions, null)).toEqual(mockTransactions);
    });

    it("should filter by envelope ID", () => {
      const result = filterByEnvelope(mockTransactions, "env1");
      expect(result).toHaveLength(2);
      expect(result.map((t) => t.id)).toEqual(["1", "4"]);
    });

    it("should handle non-existent envelope ID", () => {
      const result = filterByEnvelope(mockTransactions, "non-existent");
      expect(result).toEqual([]);
    });
  });

  describe("filterByCategory", () => {
    it("should return all transactions when no category provided", () => {
      expect(filterByCategory(mockTransactions)).toEqual(mockTransactions);
      expect(filterByCategory(mockTransactions, "")).toEqual(mockTransactions);
      expect(filterByCategory(mockTransactions, null)).toEqual(mockTransactions);
    });

    it("should filter by category (case insensitive)", () => {
      const result = filterByCategory(mockTransactions, "groceries");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("should handle non-existent category", () => {
      const result = filterByCategory(mockTransactions, "Non-existent");
      expect(result).toEqual([]);
    });

    it("should handle transactions without category", () => {
      const transactionsWithoutCategory = [
        { ...mockTransactions[0], category: undefined },
        { ...mockTransactions[1], category: null },
      ];
      const result = filterByCategory(transactionsWithoutCategory, "Groceries");
      expect(result).toEqual([]);
    });
  });

  describe("filterByType", () => {
    it("should return all transactions when no type provided", () => {
      expect(filterByType(mockTransactions)).toEqual(mockTransactions);
      expect(filterByType(mockTransactions, "")).toEqual(mockTransactions);
      expect(filterByType(mockTransactions, null)).toEqual(mockTransactions);
    });

    it("should filter income transactions", () => {
      const result = filterByType(mockTransactions, "income");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });

    it("should filter expense transactions", () => {
      const result = filterByType(mockTransactions, "expense");
      expect(result).toHaveLength(3);
      expect(result.map((t) => t.id)).toEqual(["1", "3", "4"]);
    });

    it("should filter transfer transactions", () => {
      const transferTransaction = {
        ...mockTransactions[0],
        type: "transfer" as const,
        amount: 100,
      };
      const result = filterByType([transferTransaction as never], "transfer");
      expect(result).toHaveLength(1);
    });

    it("should handle unknown type", () => {
      const result = filterByType(mockTransactions, "unknown");
      expect(result).toEqual(mockTransactions);
    });
  });

  describe("filterBySearch", () => {
    it("should return all transactions when no search query provided", () => {
      expect(filterBySearch(mockTransactions)).toEqual(mockTransactions);
      expect(filterBySearch(mockTransactions, "")).toEqual(mockTransactions);
      expect(filterBySearch(mockTransactions, "   ")).toEqual(mockTransactions);
      expect(filterBySearch(mockTransactions, null)).toEqual(mockTransactions);
    });

    it("should search by description", () => {
      const result = filterBySearch(mockTransactions, "walmart");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("should search by category", () => {
      const result = filterBySearch(mockTransactions, "income");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });

    it("should search by account", () => {
      const result = filterBySearch(mockTransactions, "credit");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("3");
    });

    it("should search by amount", () => {
      // Amount is converted to string without trailing zeros: 85.5 not 85.50
      const result = filterBySearch(mockTransactions, "85.5");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("should be case insensitive", () => {
      const result = filterBySearch(mockTransactions, "WALMART");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("should handle partial matches", () => {
      const result = filterBySearch(mockTransactions, "gas");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("3");
    });

    it("should handle transactions with missing fields", () => {
      const incompleteTransactions = [
        { id: "1", description: "Test", amount: 100 },
        { id: "2", amount: 200, account: "Test Account" },
      ];
      const result = filterBySearch(incompleteTransactions as never[], "test");
      expect(result).toHaveLength(2);
    });
  });

  describe("sortTransactions", () => {
    it("should sort by date descending by default", () => {
      const result = sortTransactions(mockTransactions);
      expect(result.map((t) => t.id)).toEqual(["4", "1", "2", "3"]);
    });

    it("should sort by date ascending", () => {
      const result = sortTransactions(mockTransactions, "date", "asc");
      expect(result.map((t) => t.id)).toEqual(["3", "1", "2", "4"]);
    });

    it("should sort by amount", () => {
      const result = sortTransactions(mockTransactions, "amount", "desc");
      expect(result.map((t) => t.id)).toEqual(["2", "1", "3", "4"]);
    });

    it("should sort by description", () => {
      const result = sortTransactions(mockTransactions, "description", "asc");
      expect(result.map((t) => t.id)).toEqual(["4", "2", "3", "1"]);
    });

    it("should sort by category", () => {
      const result = sortTransactions(mockTransactions, "category", "asc");
      expect(result.map((t) => t.id)).toEqual(["4", "1", "2", "3"]);
    });

    it("should sort by account", () => {
      const result = sortTransactions(mockTransactions, "account", "asc");
      expect(result.map((t) => t.id)).toEqual(["1", "2", "4", "3"]);
    });

    it("should handle custom sort field", () => {
      const customTransactions = mockTransactions.map((t) => ({
        ...t,
        priority: Math.random(),
      }));
      const result = sortTransactions(customTransactions, "priority");
      expect(result).toHaveLength(4);
    });

    it("should not mutate original array", () => {
      const original = [...mockTransactions];
      sortTransactions(mockTransactions, "amount");
      expect(mockTransactions).toEqual(original);
    });
  });

  describe("processTransactions", () => {
    it("should apply all filters and sorting", () => {
      const options = {
        type: "expense",
        searchQuery: "store",
        sortBy: "amount",
        sortOrder: "desc",
        limit: 1,
      };

      const result = processTransactions(mockTransactions, options);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1"); // Walmart with highest expense amount
    });

    it("should handle date range filtering", () => {
      const options = {
        dateRange: { start: "2023-09-01", end: "2023-09-02" },
        sortBy: "date",
      };

      const result = processTransactions(mockTransactions, options);
      expect(result).toHaveLength(3);
      expect(result.map((t) => t.id)).toEqual(["4", "1", "2"]);
    });

    it("should apply envelope and category filters", () => {
      const options = {
        envelopeId: "env1",
        category: "Groceries",
      };

      const result = processTransactions(mockTransactions, options);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("should handle empty options", () => {
      const result = processTransactions(mockTransactions, {});
      expect(result).toHaveLength(4);
    });

    it("should handle limit", () => {
      const result = processTransactions(mockTransactions, { limit: 2 });
      expect(result).toHaveLength(2);
    });

    it("should handle error gracefully", () => {
      const result = processTransactions(null, {});
      expect(logger.error).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("groupTransactionsByDate", () => {
    it("should group by month by default", () => {
      const result = groupTransactionsByDate(mockTransactions);
      expect(Object.keys(result)).toEqual(["2023-09", "2023-08"]);
      expect(result["2023-09"]).toHaveLength(3);
      expect(result["2023-08"]).toHaveLength(1);
    });

    it("should group by day", () => {
      const result = groupTransactionsByDate(mockTransactions, "day");
      expect(Object.keys(result)).toEqual(["2023-09-01", "2023-08-15", "2023-09-02"]);
    });

    it("should group by year", () => {
      const result = groupTransactionsByDate(mockTransactions, "year");
      expect(Object.keys(result)).toEqual(["2023"]);
      expect(result["2023"]).toHaveLength(4);
    });

    it("should handle unknown groupBy parameter", () => {
      const result = groupTransactionsByDate(mockTransactions, "unknown");
      expect(Object.keys(result)).toEqual(["all"]);
      expect(result["all"]).toHaveLength(4);
    });

    it("should handle empty transactions array", () => {
      const result = groupTransactionsByDate([]);
      expect(result).toEqual({});
    });
  });

  describe("groupTransactionsByCategory", () => {
    it("should group transactions by category", () => {
      const result = groupTransactionsByCategory(mockTransactions);
      expect(Object.keys(result)).toEqual(["Groceries", "Income", "Transportation", "Dining"]);
      expect(result["Groceries"]).toHaveLength(1);
    });

    it("should handle transactions without category", () => {
      const transactionsWithoutCategory = [
        { ...mockTransactions[0], category: undefined },
        { ...mockTransactions[1], category: null },
      ];
      const result = groupTransactionsByCategory(transactionsWithoutCategory);
      expect(result["Uncategorized"]).toHaveLength(2);
    });

    it("should handle empty transactions array", () => {
      const result = groupTransactionsByCategory([]);
      expect(result).toEqual({});
    });
  });

  describe("calculateTransactionStats", () => {
    it("should calculate comprehensive statistics", () => {
      const result = calculateTransactionStats(mockTransactions);

      expect(result.total).toBe(4);
      expect(result.totalIncome).toBe(2000.0);
      expect(result.totalExpenses).toBe(125.0); // 85.50 + 35.00 + 4.50
      expect(result.netAmount).toBe(1875.0); // 2000 - 125
      expect(result.averageTransaction).toBe(531.25); // (85.50 + 2000 + 35 + 4.50) / 4
    });

    it("should calculate category statistics", () => {
      const result = calculateTransactionStats(mockTransactions);

      expect(result.categories).toHaveProperty("Groceries");
      expect(result.categories["Groceries"]).toEqual({
        count: 1,
        total: 85.5,
      });
    });

    it("should calculate account statistics", () => {
      const result = calculateTransactionStats(mockTransactions);

      expect(result.accounts).toHaveProperty("Checking");
      expect(result.accounts["Checking"]).toEqual({
        count: 3,
        total: 2090, // abs(-85.5) = 85.5, abs(2000) = 2000, abs(-4.5) = 4.5; 85.5 + 2000 + 4.5 = 2090
      });
    });

    it("should calculate date range", () => {
      const result = calculateTransactionStats(mockTransactions);

      expect(result.dateRange.earliest).toEqual(new Date("2023-08-15"));
      expect(result.dateRange.latest).toEqual(new Date("2023-09-02"));
    });

    it("should handle empty transactions array", () => {
      const result = calculateTransactionStats([]);

      expect(result.total).toBe(0);
      expect(result.totalIncome).toBe(0);
      expect(result.totalExpenses).toBe(0);
      expect(result.netAmount).toBe(0);
      expect(result.averageTransaction).toBe(0);
      expect(result.dateRange.earliest).toBe(null);
      expect(result.dateRange.latest).toBe(null);
    });

    it("should handle transactions without category or account", () => {
      const incompleteTransactions = [
        { id: "1", amount: 100, date: "2023-09-01" },
        {
          id: "2",
          amount: -50,
          date: "2023-09-02",
          category: null,
          account: null,
        },
      ];

      const result = calculateTransactionStats(incompleteTransactions as never[]);

      expect(result.categories["Uncategorized"].count).toBe(2);
      expect(result.accounts["Unknown"].count).toBe(2);
    });

    it("should handle calculation errors gracefully", () => {
      const result = calculateTransactionStats(null);

      expect(logger.error).toHaveBeenCalled();
      expect(result.total).toBe(0);
      expect(result).toHaveProperty("error");
    });
  });
});
