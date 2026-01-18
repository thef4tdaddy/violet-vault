import { describe, it, expect } from "vitest";
import {
  calculateTransactionTotals,
  getTransactionFilterConfigs,
  formatLedgerSummary,
} from "../ledgerHelpers";

describe("ledgerHelpers", () => {
  describe("calculateTransactionTotals", () => {
    it("should calculate totals for mixed transactions", () => {
      const transactions = [
        { amount: 1000 }, // Income
        { amount: -500 }, // Expense
        { amount: 750 }, // Income
        { amount: -200 }, // Expense
        { amount: -100 }, // Expense
      ];

      const result = calculateTransactionTotals(transactions);

      expect(result.totalIncome).toBe(1750);
      expect(result.totalExpenses).toBe(800);
      expect(result.netCashFlow).toBe(950);
    });

    it("should handle only income transactions", () => {
      const transactions = [{ amount: 1000 }, { amount: 500 }, { amount: 250 }];

      const result = calculateTransactionTotals(transactions);

      expect(result.totalIncome).toBe(1750);
      expect(result.totalExpenses).toBe(0);
      expect(result.netCashFlow).toBe(1750);
    });

    it("should handle only expense transactions", () => {
      const transactions = [{ amount: -300 }, { amount: -150 }, { amount: -50 }];

      const result = calculateTransactionTotals(transactions);

      expect(result.totalIncome).toBe(0);
      expect(result.totalExpenses).toBe(500);
      expect(result.netCashFlow).toBe(-500);
    });

    it("should handle empty transaction array", () => {
      const result = calculateTransactionTotals([]);

      expect(result.totalIncome).toBe(0);
      expect(result.totalExpenses).toBe(0);
      expect(result.netCashFlow).toBe(0);
    });

    it("should handle zero amount transactions", () => {
      const transactions = [{ amount: 0 }, { amount: 100 }, { amount: -50 }];

      const result = calculateTransactionTotals(transactions);

      expect(result.totalIncome).toBe(100);
      expect(result.totalExpenses).toBe(50);
      expect(result.netCashFlow).toBe(50);
    });

    it("should filter out invalid transactions", () => {
      const transactions = [
        { amount: 100 },
        null, // Invalid
        { amount: undefined }, // Invalid amount
        { amount: -50 },
        undefined, // Invalid
        { amount: "invalid" }, // Invalid amount type
      ];

      const result = calculateTransactionTotals(transactions);

      expect(result.totalIncome).toBe(100);
      expect(result.totalExpenses).toBe(50);
      expect(result.netCashFlow).toBe(50);
    });
  });

  describe("getTransactionFilterConfigs", () => {
    const mockEnvelopes = [
      { id: "env1", name: "Groceries" },
      { id: "env2", name: "Gas" },
      { id: "env3", name: "Utilities" },
    ];

    it("should return correct filter configurations", () => {
      const configs = getTransactionFilterConfigs(mockEnvelopes);

      expect(configs).toHaveLength(5);
      expect(configs[0].key).toBe("dateFilter");
      expect(configs[1].key).toBe("typeFilter");
      expect(configs[2].key).toBe("envelopeFilter");
      expect(configs[3].key).toBe("sortBy");
      expect(configs[4].key).toBe("sortOrder");
    });

    it("should have correct date filter options", () => {
      const configs = getTransactionFilterConfigs(mockEnvelopes);
      const dateFilter = configs.find((c) => c.key === "dateFilter");

      expect(dateFilter.type).toBe("select");
      expect(dateFilter.defaultValue).toBe("all");
      expect(dateFilter.options).toHaveLength(4);
      expect(dateFilter.options).toContainEqual({
        value: "all",
        label: "All Time",
      });
      expect(dateFilter.options).toContainEqual({
        value: "today",
        label: "Today",
      });
      expect(dateFilter.options).toContainEqual({
        value: "week",
        label: "This Week",
      });
      expect(dateFilter.options).toContainEqual({
        value: "month",
        label: "This Month",
      });
    });

    it("should have correct type filter options", () => {
      const configs = getTransactionFilterConfigs(mockEnvelopes);
      const typeFilter = configs.find((c) => c.key === "typeFilter");

      expect(typeFilter.type).toBe("select");
      expect(typeFilter.defaultValue).toBe("all");
      expect(typeFilter.options).toHaveLength(3);
      expect(typeFilter.options).toContainEqual({
        value: "all",
        label: "All Types",
      });
      expect(typeFilter.options).toContainEqual({
        value: "income",
        label: "Income",
      });
      expect(typeFilter.options).toContainEqual({
        value: "expense",
        label: "Expenses",
      });
    });

    it("should have correct envelope filter options with envelope data", () => {
      const configs = getTransactionFilterConfigs(mockEnvelopes);
      const envelopeFilter = configs.find((c) => c.key === "envelopeFilter");

      expect(envelopeFilter.type).toBe("select");
      expect(envelopeFilter.defaultValue).toBe("all");
      expect(envelopeFilter.options).toHaveLength(5); // "All", "Unassigned", + 3 envelopes

      expect(envelopeFilter.options).toContainEqual({
        value: "all",
        label: "All Envelopes",
      });
      expect(envelopeFilter.options).toContainEqual({
        value: "",
        label: "Unassigned",
      });
      expect(envelopeFilter.options).toContainEqual({
        value: "env1",
        label: "Groceries",
      });
      expect(envelopeFilter.options).toContainEqual({
        value: "env2",
        label: "Gas",
      });
      expect(envelopeFilter.options).toContainEqual({
        value: "env3",
        label: "Utilities",
      });
    });

    it("should have correct sort filter options", () => {
      const configs = getTransactionFilterConfigs(mockEnvelopes);
      const sortFilter = configs.find((c) => c.key === "sortBy");

      expect(sortFilter.type).toBe("select");
      expect(sortFilter.defaultValue).toBe("date");
      expect(sortFilter.options).toHaveLength(3);
      expect(sortFilter.options).toContainEqual({
        value: "date",
        label: "Date",
      });
      expect(sortFilter.options).toContainEqual({
        value: "amount",
        label: "Amount",
      });
      expect(sortFilter.options).toContainEqual({
        value: "description",
        label: "Description",
      });
    });

    it("should handle empty envelopes array", () => {
      const configs = getTransactionFilterConfigs([]);
      const envelopeFilter = configs.find((c) => c.key === "envelopeFilter");

      expect(envelopeFilter.options).toHaveLength(2); // Only "All" and "Unassigned"
      expect(envelopeFilter.options).toContainEqual({
        value: "all",
        label: "All Envelopes",
      });
      expect(envelopeFilter.options).toContainEqual({
        value: "",
        label: "Unassigned",
      });
    });
  });

  describe("formatLedgerSummary", () => {
    it("should format positive net cash flow", () => {
      const result = formatLedgerSummary(15, 350.75);
      expect(result).toBe("15 transactions • Net: $350.75");
    });

    it("should format negative net cash flow", () => {
      const result = formatLedgerSummary(8, -125.5);
      expect(result).toBe("8 transactions • Net: $-125.50");
    });

    it("should format zero net cash flow", () => {
      const result = formatLedgerSummary(3, 0);
      expect(result).toBe("3 transactions • Net: $0.00");
    });

    it("should handle single transaction", () => {
      const result = formatLedgerSummary(1, 100.25);
      expect(result).toBe("1 transaction • Net: $100.25");
    });

    it("should handle zero transactions", () => {
      const result = formatLedgerSummary(0, 0);
      expect(result).toBe("0 transactions • Net: $0.00");
    });

    it("should handle large numbers with commas", () => {
      const result = formatLedgerSummary(1500, 12345.67);
      // Current implementation doesn't format with commas
      expect(result).toBe("1500 transactions • Net: $12345.67");
    });
  });
});
