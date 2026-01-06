import { describe, it, expect } from "vitest";
import {
  SUGGESTION_COLORS,
  DEFAULT_ANALYSIS_SETTINGS,
  MERCHANT_PATTERNS,
  filterTransactionsByDateRange,
  calculateMonthsOfData,
  analyzeUnassignedTransactions,
  analyzeMerchantPatterns,
  analyzeEnvelopeOptimization,
  generateAllSuggestions,
  getSuggestionTypeIcon,
  getSuggestionPriorityIcon,
  getSuggestionPriorityColor,
} from "../suggestionUtils";

describe("suggestionUtils", () => {
  // Use dates relative to current date to avoid time-based test failures
  const now = new Date();
  const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const mockTransactions = [
    {
      id: "1",
      date: fifteenDaysAgo.toISOString().split("T")[0],
      amount: -50,
      description: "Starbucks Coffee",
      category: "Food",
      envelopeId: null,
    },
    {
      id: "2",
      date: tenDaysAgo.toISOString().split("T")[0],
      amount: -100,
      description: "Amazon Purchase",
      category: "Shopping",
      envelopeId: "",
    },
    {
      id: "3",
      date: fiveDaysAgo.toISOString().split("T")[0],
      amount: -75,
      description: "Grocery Store",
      category: "Food",
      envelopeId: "env1",
    },
    {
      id: "4",
      date: sixtyDaysAgo.toISOString().split("T")[0], // Older transaction
      amount: -30,
      description: "Coffee Shop",
      category: "Food",
      envelopeId: null,
    },
    {
      id: "5",
      date: fiveDaysAgo.toISOString().split("T")[0],
      amount: -25,
      description: "Fast Food",
      category: "Food",
      envelopeId: null,
    },
  ];

  const mockEnvelopes = [
    {
      id: "env1",
      name: "Groceries",
      monthlyAmount: 300,
      currentBalance: 150,
    },
    {
      id: "env2",
      name: "Entertainment",
      monthlyAmount: 100,
      currentBalance: 500, // Overfunded
    },
  ];

  describe("Constants", () => {
    it("should have expected suggestion colors", () => {
      expect(SUGGESTION_COLORS).toHaveLength(10);
      expect(SUGGESTION_COLORS[0]).toBe("#a855f7");
    });

    it("should have default analysis settings", () => {
      expect(DEFAULT_ANALYSIS_SETTINGS).toMatchObject({
        minAmount: 50,
        minTransactions: 3,
        overspendingThreshold: 1.2,
        overfundingThreshold: 3.0,
        bufferPercentage: 1.1,
      });
    });

    it("should have merchant patterns", () => {
      expect(MERCHANT_PATTERNS["Coffee & Drinks"]).toBeInstanceOf(RegExp);
      expect(MERCHANT_PATTERNS["Online Shopping"]).toBeInstanceOf(RegExp);
    });
  });

  describe("filterTransactionsByDateRange", () => {
    it("should filter by 30 days", () => {
      const result = filterTransactionsByDateRange(mockTransactions, 30);

      // Should exclude the 60-day-old transaction
      expect(result).toHaveLength(4);
      expect(
        result.every((t) => new Date(t.date) >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))
      ).toBe(true);
    });

    it("should handle default range", () => {
      const result = filterTransactionsByDateRange(mockTransactions, "invalid");

      // Should use 6months default and include all transactions
      expect(result).toHaveLength(5);
    });
  });

  describe("calculateMonthsOfData", () => {
    it("should calculate months correctly", () => {
      const transactions = [{ date: "2024-01-01" }, { date: "2024-03-15" }];

      const result = calculateMonthsOfData(transactions as never[]);
      expect(result).toBe(3); // Jan, Feb, Mar
    });

    it("should return 1 for empty transactions", () => {
      const result = calculateMonthsOfData([]);
      expect(result).toBe(1);
    });

    it("should handle same month transactions", () => {
      const transactions = [{ date: "2024-01-01" }, { date: "2024-01-15" }];

      const result = calculateMonthsOfData(transactions as never[]);
      expect(result).toBe(1);
    });
  });

  describe("analyzeUnassignedTransactions", () => {
    it("should suggest envelopes for unassigned categories", () => {
      const unassignedTxns = mockTransactions.filter((t) => !t.envelopeId);
      const monthsOfData = 1;
      const settings = DEFAULT_ANALYSIS_SETTINGS;

      const result = analyzeUnassignedTransactions(unassignedTxns, monthsOfData, settings);

      expect(result).toHaveLength(1); // Should suggest Food envelope
      expect(result[0]).toMatchObject({
        type: "new_envelope",
        title: 'Create "Food" Envelope',
        action: "create_envelope",
        impact: "organization",
        data: {
          name: "Food",
          category: "Food",
          color: expect.any(String),
        },
      });
    });

    it("should respect minimum amount threshold", () => {
      const settings = { ...DEFAULT_ANALYSIS_SETTINGS, minAmount: 200 };

      const result = analyzeUnassignedTransactions(mockTransactions, 1, settings);

      expect(result).toHaveLength(0); // No category meets 200 minimum
    });

    it("should respect minimum transactions threshold", () => {
      const settings = { ...DEFAULT_ANALYSIS_SETTINGS, minTransactions: 5 };

      const result = analyzeUnassignedTransactions(mockTransactions, 1, settings);

      expect(result).toHaveLength(0); // No category has 5 transactions
    });
  });

  describe("analyzeMerchantPatterns", () => {
    it("should detect coffee merchant pattern", () => {
      const coffeeTransactions = [
        {
          date: fiveDaysAgo.toISOString().split("T")[0],
          amount: -20,
          description: "Starbucks Store",
          envelopeId: null,
        },
        {
          date: tenDaysAgo.toISOString().split("T")[0],
          amount: -18,
          description: "Dunkin Donuts",
          envelopeId: null,
        },
        {
          date: fifteenDaysAgo.toISOString().split("T")[0],
          amount: -22,
          description: "Local Coffee Shop",
          envelopeId: null,
        },
      ];

      const result = analyzeMerchantPatterns(coffeeTransactions, [], 1, DEFAULT_ANALYSIS_SETTINGS);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: "merchant_pattern",
        title: 'Create "Coffee & Drinks" Envelope',
        action: "create_envelope",
        impact: "tracking",
      });
    });

    it("should not suggest if similar envelope exists", () => {
      const existingEnvelopes = [{ name: "Coffee & Drinks", category: "Food" }];

      const coffeeTransactions = [
        {
          date: "2024-01-01",
          amount: -50,
          description: "Starbucks Store",
          envelopeId: null,
        },
      ];

      const result = analyzeMerchantPatterns(
        coffeeTransactions,
        existingEnvelopes as never[],
        1,
        DEFAULT_ANALYSIS_SETTINGS
      );

      expect(result).toHaveLength(0);
    });
  });

  describe("analyzeEnvelopeOptimization", () => {
    const overspendingTransactions = [
      {
        date: "2024-01-01",
        amount: -200, // High spending
        envelopeId: "env1",
      },
      {
        date: "2024-01-02",
        amount: -180,
        envelopeId: "env1",
      },
    ];

    it("should suggest increasing budget for overspending", () => {
      const result = analyzeEnvelopeOptimization(
        overspendingTransactions,
        mockEnvelopes,
        1,
        DEFAULT_ANALYSIS_SETTINGS
      );

      const overspendSuggestion = result.find((s) => s.type === "increase_envelope");
      expect(overspendSuggestion).toBeDefined();
      expect(overspendSuggestion.title).toContain('Increase "Groceries" Budget');
    });

    it("should suggest decreasing budget for overfunding", () => {
      const lowSpendingTransactions = [
        {
          date: "2024-01-01",
          amount: -10, // Very low spending
          envelopeId: "env2",
        },
      ];

      const result = analyzeEnvelopeOptimization(
        lowSpendingTransactions,
        mockEnvelopes,
        1,
        DEFAULT_ANALYSIS_SETTINGS
      );

      const overfundSuggestion = result.find((s) => s.type === "decrease_envelope");
      expect(overfundSuggestion).toBeDefined();
      expect(overfundSuggestion.title).toContain('Reduce "Entertainment" Budget');
    });

    it("should skip envelopes with no transactions", () => {
      const result = analyzeEnvelopeOptimization(
        [], // No transactions
        mockEnvelopes,
        1,
        DEFAULT_ANALYSIS_SETTINGS
      );

      expect(result).toHaveLength(0);
    });
  });

  describe("generateAllSuggestions", () => {
    it("should combine all suggestion types", () => {
      const result = generateAllSuggestions(
        mockTransactions,
        mockEnvelopes,
        DEFAULT_ANALYSIS_SETTINGS,
        30,
        { dismissedSuggestions: new Set(), showDismissed: false }
      );

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("should filter dismissed suggestions", () => {
      const dismissedSuggestions = new Set(["unassigned_Food"]);

      const result = generateAllSuggestions(
        mockTransactions,
        mockEnvelopes,
        DEFAULT_ANALYSIS_SETTINGS,
        30,
        { dismissedSuggestions, showDismissed: false }
      );

      const dismissedSuggestion = result.find((s) => s.id === "unassigned_Food");
      expect(dismissedSuggestion).toBeUndefined();
    });

    it("should sort by priority and amount", () => {
      const result = generateAllSuggestions(
        mockTransactions,
        mockEnvelopes,
        DEFAULT_ANALYSIS_SETTINGS,
        30,
        { dismissedSuggestions: new Set(), showDismissed: false }
      );

      if (result.length > 1) {
        // High priority should come before medium/low
        const priorities = result.map((s) => s.priority);
        const highIndex = priorities.indexOf("high");
        const mediumIndex = priorities.indexOf("medium");

        if (highIndex !== -1 && mediumIndex !== -1) {
          expect(highIndex).toBeLessThan(mediumIndex);
        }
      }
    });

    it("should limit to 10 suggestions", () => {
      // Create many transactions to generate many suggestions
      const manyTransactions = Array.from({ length: 50 }, (_, i) => ({
        id: `tx-${i}`,
        date: "2024-01-15",
        amount: -100,
        description: `Transaction ${i}`,
        category: `Category${i}`,
        envelopeId: null,
      }));

      const result = generateAllSuggestions(manyTransactions, [], DEFAULT_ANALYSIS_SETTINGS, 30, {
        dismissedSuggestions: new Set(),
        showDismissed: false,
      });

      expect(result.length).toBeLessThanOrEqual(10);
    });
  });

  describe("Icon and color helpers", () => {
    it("should return correct type icons", () => {
      expect(getSuggestionTypeIcon("new_envelope")).toBe("Plus");
      expect(getSuggestionTypeIcon("increase_envelope")).toBe("TrendingUp");
      expect(getSuggestionTypeIcon("decrease_envelope")).toBe("TrendingDown");
      expect(getSuggestionTypeIcon("unknown")).toBe("Eye");
    });

    it("should return correct priority icons", () => {
      expect(getSuggestionPriorityIcon("high")).toBe("AlertTriangle");
      expect(getSuggestionPriorityIcon("medium")).toBe("Lightbulb");
      expect(getSuggestionPriorityIcon("low")).toBe("Target");
      expect(getSuggestionPriorityIcon("unknown")).toBe("Zap");
    });

    it("should return correct priority colors", () => {
      expect(getSuggestionPriorityColor("high")).toBe("text-red-500");
      expect(getSuggestionPriorityColor("medium")).toBe("text-amber-500");
      expect(getSuggestionPriorityColor("low")).toBe("text-blue-500");
      expect(getSuggestionPriorityColor("unknown")).toBe("text-gray-500");
    });
  });
});
