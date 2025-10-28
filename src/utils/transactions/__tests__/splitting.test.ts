/**
 * Tests for Transaction Splitting Utilities
 * Testing split calculation, validation, and manipulation functions
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  findEnvelopeForCategory,
  initializeSplitsFromTransaction,
  calculateSplitTotals,
  validateSplitAllocations,
  autoBalanceSplits,
  splitEvenly,
  addNewSplit,
  updateSplitField,
  removeSplit,
  prepareSplitTransactions,
  getSplitSummary,
} from "../splitting";

// Mock logger
vi.mock("../../common/logger.js", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Transaction Splitting Utilities", () => {
  const mockEnvelopes = [
    { id: "env1", name: "Groceries", category: "Food", currentBalance: 0, targetAmount: 0 },
    { id: "env2", name: "Gas", category: "Transportation", currentBalance: 0, targetAmount: 0 },
    { id: "env3", name: "Dining", category: "Food", currentBalance: 0, targetAmount: 0 },
  ];

  const mockTransaction = {
    id: "txn1",
    description: "Test Transaction",
    amount: -100.0,
    category: "Food",
    date: "2023-01-01",
    envelopeId: "env1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findEnvelopeForCategory", () => {
    it("should find envelope by exact name match", () => {
      const envelope = findEnvelopeForCategory(mockEnvelopes, "Groceries");
      expect(envelope).toEqual(mockEnvelopes[0]);
    });

    it("should find envelope by category match", () => {
      const envelope = findEnvelopeForCategory(mockEnvelopes, "Food");
      expect(envelope).toEqual(mockEnvelopes[0]);
    });

    it("should be case insensitive", () => {
      const envelope = findEnvelopeForCategory(mockEnvelopes, "groceries");
      expect(envelope).toEqual(mockEnvelopes[0]);
    });

    it("should return null for no match", () => {
      const envelope = findEnvelopeForCategory(mockEnvelopes, "Unknown");
      expect(envelope).toBeNull();
    });

    it("should handle empty inputs", () => {
      expect(findEnvelopeForCategory([], "Food")).toBeNull();
      expect(findEnvelopeForCategory(mockEnvelopes, "")).toBeNull();
      expect(findEnvelopeForCategory(mockEnvelopes, null)).toBeNull();
    });
  });

  describe("initializeSplitsFromTransaction", () => {
    it("should create single split for simple transaction", () => {
      const splits = initializeSplitsFromTransaction(mockTransaction, mockEnvelopes);

      expect(splits).toHaveLength(1);
      expect(splits[0]).toMatchObject({
        description: "Test Transaction",
        amount: 100.0, // Should be absolute value
        category: "Food",
        envelopeId: "env1",
        isOriginalItem: false,
      });
    });

    it("should handle itemized transaction with metadata", () => {
      const itemizedTransaction = {
        ...mockTransaction,
        metadata: {
          items: [
            { name: "Milk", totalPrice: 5.5, category: { name: "Food" } },
            { name: "Bread", totalPrice: 3.25, category: { name: "Food" } },
          ],
          shipping: 2.0,
          tax: 1.25,
        },
      };

      const splits = initializeSplitsFromTransaction(itemizedTransaction, mockEnvelopes);

      expect(splits).toHaveLength(4); // 2 items + shipping + tax
      expect(splits[0]).toMatchObject({
        description: "Milk",
        amount: 5.5,
        category: "Food",
        isOriginalItem: true,
      });
      expect(splits[2].description).toBe("Shipping & Handling");
      expect(splits[3].description).toBe("Sales Tax");
    });

    it("should return empty array for null transaction", () => {
      const splits = initializeSplitsFromTransaction(null, mockEnvelopes);
      expect(splits).toEqual([]);
    });
  });

  describe("calculateSplitTotals", () => {
    const testSplits = [
      { id: 1, description: "Split 1", amount: 30, category: "Food", envelopeId: "env1" },
      { id: 2, description: "Split 2", amount: 40, category: "Food", envelopeId: "env2" },
      { id: 3, description: "Split 3", amount: 30, category: "Food", envelopeId: "env3" },
    ];

    it("should calculate totals correctly", () => {
      const totals = calculateSplitTotals(mockTransaction, testSplits);

      expect(totals).toMatchObject({
        original: 100.0,
        allocated: 100.0,
        remaining: 0.0,
        isValid: true,
        isOverAllocated: false,
        isUnderAllocated: false,
      });
    });

    it("should detect over-allocation", () => {
      const overSplits = [
        { id: 1, description: "Split 1", amount: 60, category: "Food", envelopeId: "env1" },
        { id: 2, description: "Split 2", amount: 60, category: "Food", envelopeId: "env2" },
      ];

      const totals = calculateSplitTotals(mockTransaction, overSplits);

      expect(totals.isOverAllocated).toBe(true);
      expect(totals.isValid).toBe(false);
      expect(totals.remaining).toBe(-20);
    });

    it("should detect under-allocation", () => {
      const underSplits = [
        { id: 1, description: "Split 1", amount: 30, category: "Food", envelopeId: "env1" },
        { id: 2, description: "Split 2", amount: 40, category: "Food", envelopeId: "env2" },
      ];

      const totals = calculateSplitTotals(mockTransaction, underSplits);

      expect(totals.isUnderAllocated).toBe(true);
      expect(totals.isValid).toBe(false);
      expect(totals.remaining).toBe(30);
    });

    it("should handle empty splits", () => {
      const totals = calculateSplitTotals(mockTransaction, []);

      expect(totals).toMatchObject({
        original: 100.0,
        allocated: 0.0,
        remaining: 100.0,
        isUnderAllocated: true,
      });
    });
  });

  describe("validateSplitAllocations", () => {
    it("should validate correct splits", () => {
      const validSplits = [
        { id: 1, description: "Split 1", category: "Food", amount: 50, envelopeId: "env1" },
        { id: 2, description: "Split 2", category: "Gas", amount: 50, envelopeId: "env2" },
      ];

      const errors = validateSplitAllocations(validSplits, mockTransaction);
      expect(errors).toEqual([]);
    });

    it("should catch missing description", () => {
      const invalidSplits = [
        { id: 1, description: "", category: "Food", amount: 100, envelopeId: "env1" },
      ];

      const errors = validateSplitAllocations(invalidSplits, mockTransaction);
      expect(errors).toContain("Split 1: Description is required");
    });

    it("should catch missing category", () => {
      const invalidSplits = [
        { id: 1, description: "Split 1", category: "", amount: 100, envelopeId: "env1" },
      ];

      const errors = validateSplitAllocations(invalidSplits, mockTransaction);
      expect(errors).toContain("Split 1: Category is required");
    });

    it("should catch invalid amounts", () => {
      const invalidSplits = [
        { id: 1, description: "Split 1", category: "Food", amount: 0, envelopeId: "env1" },
        { id: 2, description: "Split 2", category: "Gas", amount: -10, envelopeId: "env2" },
      ];

      const errors = validateSplitAllocations(invalidSplits, mockTransaction);
      expect(errors).toContain("Split 1: Amount must be greater than 0");
      expect(errors).toContain("Split 2: Amount must be greater than 0");
    });

    it("should catch total amount mismatches", () => {
      const mismatchedSplits = [
        { id: 1, description: "Split 1", category: "Food", amount: 120, envelopeId: "env1" },
      ];

      const errors = validateSplitAllocations(mismatchedSplits, mockTransaction);
      expect(errors.some((error) => error.includes("exceed original amount"))).toBe(true);
    });
  });

  describe("autoBalanceSplits", () => {
    it("should balance uneven splits", () => {
      const unevenSplits = [
        { id: 1, description: "Split 1", category: "Food", amount: 30, envelopeId: "env1" },
        { id: 2, description: "Split 2", category: "Food", amount: 40, envelopeId: "env2" },
        { id: 3, description: "Split 3", category: "Food", amount: 20, envelopeId: "env3" }, // Total: 90, need to add 10 more
      ];

      const balanced = autoBalanceSplits(unevenSplits, mockTransaction);
      const total = balanced.reduce((sum, split) => sum + split.amount, 0);

      expect(total).toBeCloseTo(100, 2);
    });

    it("should not modify already balanced splits", () => {
      const balancedSplits = [
        { id: 1, description: "Split 1", category: "Food", amount: 50, envelopeId: "env1" },
        { id: 2, description: "Split 2", category: "Food", amount: 50, envelopeId: "env2" },
      ];

      const result = autoBalanceSplits(balancedSplits, mockTransaction);
      expect(result).toEqual(balancedSplits);
    });

    it("should handle empty splits", () => {
      const result = autoBalanceSplits([], mockTransaction);
      expect(result).toEqual([]);
    });
  });

  describe("splitEvenly", () => {
    it("should split amount evenly", () => {
      const splits = [
        { id: 1, description: "Split 1", category: "Food", amount: 0, envelopeId: "env1" },
        { id: 2, description: "Split 2", category: "Food", amount: 0, envelopeId: "env2" },
        { id: 3, description: "Split 3", category: "Food", amount: 0, envelopeId: "env3" },
      ];

      const evenSplits = splitEvenly(splits, mockTransaction);

      expect(evenSplits).toHaveLength(3);
      expect(evenSplits[0].amount).toBeCloseTo(33.33, 2);
      expect(evenSplits[1].amount).toBeCloseTo(33.33, 2);
      // Last split gets remainder to handle rounding
      expect(evenSplits[2].amount).toBeCloseTo(33.34, 2);
    });

    it("should handle single split", () => {
      const splits = [
        { id: 1, description: "Split 1", category: "Food", amount: 0, envelopeId: "env1" },
      ];

      const evenSplits = splitEvenly(splits, mockTransaction);

      expect(evenSplits[0].amount).toBe(100);
    });

    it("should preserve other properties", () => {
      const splits = [
        { id: 1, description: "Test", category: "Food", amount: 0, envelopeId: "env1" },
      ];

      const evenSplits = splitEvenly(splits, mockTransaction);

      expect(evenSplits[0]).toMatchObject({
        id: 1,
        description: "Test",
        category: "Food",
        amount: 100,
        envelopeId: "env1",
      });
    });
  });

  describe("addNewSplit", () => {
    it("should add new split with remaining amount", () => {
      const currentSplits = [
        { id: 1, description: "Split 1", category: "Food", amount: 40, envelopeId: "env1" },
        { id: 2, description: "Split 2", category: "Food", amount: 30, envelopeId: "env2" },
      ];

      const newSplits = addNewSplit(currentSplits, mockTransaction);

      expect(newSplits).toHaveLength(3);
      expect(newSplits[2].amount).toBe(30); // Remaining amount
    });

    it("should use defaults for new split", () => {
      const currentSplits = [];
      const defaults = {
        description: "New Split",
        category: "Test Category",
      };

      const newSplits = addNewSplit(currentSplits, mockTransaction, defaults);

      expect(newSplits[0]).toMatchObject({
        description: "New Split",
        category: "Test Category",
        amount: 100,
        isOriginalItem: false,
      });
    });
  });

  describe("updateSplitField", () => {
    it("should update specified field", () => {
      const splits = [
        { id: 1, description: "Old", amount: 50, category: "Food", envelopeId: "env1" },
        { id: 2, description: "Test", amount: 50, category: "Food", envelopeId: "env2" },
      ];

      const updated = updateSplitField(splits, 1, "description", "New Description");

      expect(updated[0].description).toBe("New Description");
      expect(updated[1]).toEqual(splits[1]); // Unchanged
    });

    it("should auto-update envelope when category changes", () => {
      const splits = [
        { id: 1, description: "Split 1", amount: 100, category: "Old", envelopeId: "" },
      ];

      const updated = updateSplitField(splits, 1, "category", "Food", mockEnvelopes);

      expect(updated[0].category).toBe("Food");
      expect(updated[0].envelopeId).toBe("env1"); // Auto-matched envelope
    });
  });

  describe("removeSplit", () => {
    it("should remove specified split", () => {
      const splits = [
        { id: 1, description: "Keep", amount: 30, category: "Food", envelopeId: "env1" },
        { id: 2, description: "Remove", amount: 30, category: "Food", envelopeId: "env2" },
        { id: 3, description: "Keep", amount: 40, category: "Food", envelopeId: "env3" },
      ];

      const updated = removeSplit(splits, 2);

      expect(updated).toHaveLength(2);
      expect(updated.map((s) => s.description)).toEqual(["Keep", "Keep"]);
    });

    it("should not remove last remaining split", () => {
      const splits = [
        { id: 1, description: "Only", amount: 100, category: "Food", envelopeId: "env1" },
      ];

      const updated = removeSplit(splits, 1);

      expect(updated).toEqual(splits); // Unchanged
    });
  });

  describe("prepareSplitTransactions", () => {
    it("should prepare split transactions correctly", () => {
      const splits = [
        {
          id: "split1",
          description: "Split 1",
          amount: 60,
          category: "Food",
          envelopeId: "env1",
        },
        {
          id: "split2",
          description: "Split 2",
          amount: 40,
          category: "Gas",
          envelopeId: "env2",
        },
      ];

      const prepared = prepareSplitTransactions(splits, mockTransaction);

      expect(prepared).toHaveLength(2);
      expect(prepared[0]).toMatchObject({
        id: "txn1_split_0",
        parentTransactionId: "txn1",
        description: "Split 1",
        amount: -60, // Preserves original sign
        category: "Food",
        envelopeId: "env1",
        isSplit: true,
        splitIndex: 0,
        splitTotal: 2,
      });
    });

    it("should preserve original transaction properties", () => {
      const splits = [
        { id: 1, description: "Split", amount: 100, category: "Food", envelopeId: "env1" },
      ];

      const prepared = prepareSplitTransactions(splits, mockTransaction);

      expect(prepared[0]).toMatchObject({
        date: mockTransaction.date,
        originalAmount: mockTransaction.amount,
      });
    });
  });

  describe("getSplitSummary", () => {
    it("should provide comprehensive summary", () => {
      const validSplits = [
        { id: 1, description: "Split 1", category: "Food", amount: 50, envelopeId: "env1" },
        { id: 2, description: "Split 2", category: "Gas", amount: 50, envelopeId: "env2" },
      ];

      const summary = getSplitSummary(validSplits, mockTransaction);

      expect(summary).toMatchObject({
        totalSplits: 2,
        originalAmount: 100,
        allocatedAmount: 100,
        remainingAmount: 0,
        isValid: true,
        isBalanced: true,
        validationErrors: [],
        canSubmit: true,
      });
    });

    it("should detect invalid state", () => {
      const invalidSplits = [
        { id: 1, description: "", category: "Food", amount: 120, envelopeId: "env1" },
      ];

      const summary = getSplitSummary(invalidSplits, mockTransaction);

      expect(summary.isValid).toBe(false);
      expect(summary.canSubmit).toBe(false);
      expect(summary.validationErrors.length).toBeGreaterThan(0);
    });
  });
});
