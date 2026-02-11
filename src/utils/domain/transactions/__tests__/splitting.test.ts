import { describe, it, expect, vi } from "vitest";
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
import type { Transaction, Envelope, SplitAllocation } from "@/types/finance";

describe("splitting utils", () => {
  const mockEnvelopes: Envelope[] = [
    { id: "env-1", name: "Groceries", category: "Food" } as Envelope,
    { id: "env-2", name: "Rent", category: "Housing" } as Envelope,
  ];

  const mockTransaction: Transaction = {
    id: "tx-1",
    description: "Target Store",
    amount: -100.0,
    category: "Groceries",
    envelopeId: "env-1",
    date: "2024-01-01",
    account: "Checking",
    type: "expense",
  } as Transaction;

  describe("findEnvelopeForCategory", () => {
    it("should find envelope by name (case-insensitive)", () => {
      expect(findEnvelopeForCategory(mockEnvelopes, "groceries")?.id).toBe("env-1");
    });

    it("should find envelope by category field", () => {
      expect(findEnvelopeForCategory(mockEnvelopes, "Housing")?.id).toBe("env-2");
    });

    it("should return null if not found", () => {
      expect(findEnvelopeForCategory(mockEnvelopes, "Unknown")).toBeNull();
    });
  });

  describe("initializeSplitsFromTransaction", () => {
    it("should create a single default split if no metadata items exist", () => {
      const splits = initializeSplitsFromTransaction(mockTransaction, mockEnvelopes);
      expect(splits).toHaveLength(1);
      expect(splits[0].amount).toBe(100); // Abs value
      expect(splits[0].description).toBe(mockTransaction.description);
    });

    it("should initialize multiple splits from itemized metadata", () => {
      const itemizedTx = {
        ...mockTransaction,
        metadata: {
          items: [
            { name: "Milk", totalPrice: 5, category: { name: "Groceries" } },
            { name: "Coffee", totalPrice: 15, category: { name: "Groceries" } },
          ],
          shipping: 2,
          tax: 1,
        },
      } as Transaction;

      const splits = initializeSplitsFromTransaction(itemizedTx, mockEnvelopes);
      // 2 items + 1 shipping + 1 tax = 4 splits
      expect(splits).toHaveLength(4);
      expect(splits.find((s) => s.description === "Shipping & Handling")?.amount).toBe(2);
      expect(splits.find((s) => s.description === "Milk")?.amount).toBe(5);
    });
  });

  describe("calculateSplitTotals", () => {
    it("should calculate correct totals and validity with 0.01 tolerance", () => {
      const splits: SplitAllocation[] = [
        { amount: 33.33 } as any,
        { amount: 33.33 } as any,
        { amount: 33.33 } as any,
      ];
      const tx = { amount: -100 } as Transaction; // Original is 100

      const totals = calculateSplitTotals(tx, splits);
      expect(totals.allocated).toBe(99.99);
      expect(totals.remaining).toBeCloseTo(0.01);
      expect(totals.isValid).toBe(true); // Within 0.01
    });

    it("should mark as invalid if difference is > 0.01", () => {
      const splits = [{ amount: 50 }] as any;
      const tx = { amount: -100 } as Transaction;
      const totals = calculateSplitTotals(tx, splits);
      expect(totals.isValid).toBe(false);
      expect(totals.isUnderAllocated).toBe(true);
    });
  });

  describe("autoBalanceSplits", () => {
    it("should adjust splits to match total", () => {
      const splits: SplitAllocation[] = [{ amount: 40 } as any, { amount: 40 } as any];
      const tx = { amount: -100 } as Transaction;

      const balanced = autoBalanceSplits(splits, tx);
      expect(balanced[0].amount).toBe(50);
      expect(balanced[1].amount).toBe(50);
    });
  });

  describe("splitEvenly", () => {
    it("should handle rounding correctly on the last split", () => {
      const splits: SplitAllocation[] = [{}, {}, {}] as any;
      const tx = { amount: -10 } as Transaction;

      const result = splitEvenly(splits, tx);
      expect(result[0].amount).toBe(3.33);
      expect(result[1].amount).toBe(3.33);
      expect(result[2].amount).toBe(3.34); // Adjusted for rounding

      const total = result.reduce((s, a) => s + a.amount, 0);
      expect(total).toBe(10);
    });
  });

  describe("addNewSplit", () => {
    it("should add a split with the remaining balance", () => {
      const currentSplits = [{ amount: 70 }] as any;
      const tx = { amount: -100, category: "Food" } as Transaction;

      const result = addNewSplit(currentSplits, tx);
      expect(result).toHaveLength(2);
      expect(result[1].amount).toBe(30);
      expect(result[1].category).toBe("Food");
    });
  });

  describe("updateSplitField", () => {
    it("should update field and lookup envelope if category changes", () => {
      const currentSplits = [{ id: 1, amount: 50, category: "Old", envelopeId: "" }] as any;

      const result = updateSplitField(currentSplits, 1, "category", "Rent", mockEnvelopes);
      expect(result[0].category).toBe("Rent");
      expect(result[0].envelopeId).toBe("env-2"); // Found via lookup
    });
  });

  describe("removeSplit", () => {
    it("should remove split by ID if length > 1", () => {
      const currentSplits = [{ id: 1 }, { id: 2 }] as any;
      const result = removeSplit(currentSplits, 1);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    it("should not remove if it's the last split", () => {
      const currentSplits = [{ id: 1 }] as any;
      const result = removeSplit(currentSplits, 1);
      expect(result).toHaveLength(1);
    });
  });

  describe("prepareSplitTransactions", () => {
    it("should map allocations to full transactions with correct signs", () => {
      const splits = [
        { description: "S1", amount: 40, category: "C1", envelopeId: "E1" },
        { description: "S2", amount: 60, category: "C2", envelopeId: "E2" },
      ] as any;
      const tx = { ...mockTransaction, amount: -100 };

      const prepared = prepareSplitTransactions(splits, tx);
      expect(prepared).toHaveLength(2);
      expect(prepared[0].amount).toBe(-40); // Preserves sign
      expect(prepared[0].isSplit).toBe(true);
      expect(prepared[0].parentTransactionId).toBe(tx.id);
    });
  });

  describe("getSplitSummary", () => {
    it("should provide a comprehensive summary", () => {
      const splits = [{ amount: 100, description: "D", category: "C" }] as any;
      const summary = getSplitSummary(splits, mockTransaction);

      expect(summary.isValid).toBe(true);
      expect(summary.canSubmit).toBe(true);
      expect(summary.totalSplits).toBe(1);
    });

    it("should return invalid and show errors if not balanced", () => {
      const splits = [{ amount: 50, description: "D", category: "C" }] as any;
      const summary = getSplitSummary(splits, mockTransaction);

      expect(summary.isValid).toBe(false);
      expect(summary.validationErrors.length).toBeGreaterThan(0);
    });
  });
});
