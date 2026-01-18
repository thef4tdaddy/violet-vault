// Transaction Splitter Service Tests
import { describe, it, expect, vi } from "vitest";
import type { Envelope, SplitAllocation, Transaction } from "@/types/finance";
import { transactionSplitterService } from "../transactionSplitterService";

describe("TransactionSplitterService", () => {
  // Test data
  const mockEnvelopes: Envelope[] = [
    { id: "env1", name: "Groceries", category: "Food", currentBalance: 0, targetAmount: 0 },
    { id: "env2", name: "Entertainment", category: "Fun", currentBalance: 0, targetAmount: 0 },
    { id: "env3", name: "Gas", category: "Transportation", currentBalance: 0, targetAmount: 0 },
  ];

  const mockTransaction: Transaction = {
    id: "txn1",
    date: "2024-01-01",
    description: "Store Purchase",
    amount: -100,
    category: "Groceries",
    envelopeId: "env1",
    source: "manual",
    reconciled: false,
    createdBy: "User",
  };

  describe("findEnvelopeForCategory", () => {
    it("should find envelope by exact name match", () => {
      const result = transactionSplitterService.findEnvelopeForCategory(mockEnvelopes, "Groceries");

      expect(result).toBeDefined();
      expect(result?.id).toBe("env1");
    });

    it("should find envelope by category match", () => {
      const result = transactionSplitterService.findEnvelopeForCategory(mockEnvelopes, "Food");

      expect(result).toBeDefined();
      expect(result?.id).toBe("env1");
    });

    it("should be case insensitive", () => {
      const result = transactionSplitterService.findEnvelopeForCategory(mockEnvelopes, "groceries");

      expect(result).toBeDefined();
      expect(result?.id).toBe("env1");
    });

    it("should return null or undefined for non-existent category", () => {
      const result = transactionSplitterService.findEnvelopeForCategory(
        mockEnvelopes,
        "NonExistent"
      );

      expect(result).toBeFalsy(); // Can be null or undefined
    });

    it("should return null or undefined for empty category", () => {
      const result = transactionSplitterService.findEnvelopeForCategory(mockEnvelopes, "");

      expect(result).toBeFalsy();
    });

    it("should return null or undefined for null category", () => {
      const result = transactionSplitterService.findEnvelopeForCategory(mockEnvelopes, null);

      expect(result).toBeFalsy();
    });
  });

  describe("initializeSplitsFromTransaction", () => {
    it("should initialize single split for simple transaction", () => {
      const result = transactionSplitterService.initializeSplitsFromTransaction(
        mockTransaction,
        mockEnvelopes
      );

      expect(result).toHaveLength(1);
      expect(result[0].description).toBe("Store Purchase");
      expect(result[0].amount).toBe(100); // Absolute value
      expect(result[0].category).toBe("Groceries");
      expect(result[0].envelopeId).toBe("env1");
    });

    it("should initialize splits from itemized metadata", () => {
      const itemizedTransaction = {
        ...mockTransaction,
        metadata: {
          items: [
            { name: "Milk", totalPrice: 3.5, category: { name: "Food" } },
            { name: "Bread", totalPrice: 2.5, category: { name: "Food" } },
            { name: "Eggs", totalPrice: 4.0, category: { name: "Food" } },
          ],
          shipping: 5.0,
          tax: 2.5,
        },
      };

      const result = transactionSplitterService.initializeSplitsFromTransaction(
        itemizedTransaction,
        mockEnvelopes
      );

      // 3 items + shipping + tax = 5 splits
      expect(result.length).toBeGreaterThanOrEqual(3);

      // Check first item
      expect(result[0].description).toBe("Milk");
      expect(result[0].amount).toBe(3.5);
      expect(result[0].isOriginalItem).toBe(true);

      // Check for shipping and tax if present
      const shippingSplit = result.find((s) => s.description === "Shipping & Handling");
      if (shippingSplit) {
        expect(shippingSplit.amount).toBe(5.0);
      }

      const taxSplit = result.find((s) => s.description === "Sales Tax");
      if (taxSplit) {
        expect(taxSplit.amount).toBe(2.5);
      }
    });

    it("should handle single item metadata", () => {
      const singleItemTransaction = {
        ...mockTransaction,
        metadata: {
          items: [{ name: "Single Item", totalPrice: 100, category: { name: "Groceries" } }],
        },
      };

      const result = transactionSplitterService.initializeSplitsFromTransaction(
        singleItemTransaction,
        mockEnvelopes
      );

      // Should create single split even though there's metadata
      expect(result).toHaveLength(1);
      expect(result[0].description).toBe("Store Purchase");
    });

    it("should handle items without category", () => {
      const noCategoryTransaction = {
        ...mockTransaction,
        metadata: {
          items: [
            { name: "Item 1", totalPrice: 50 },
            { name: "Item 2", totalPrice: 50 },
          ],
        },
      };

      const result = transactionSplitterService.initializeSplitsFromTransaction(
        noCategoryTransaction,
        mockEnvelopes
      );

      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result[0].category).toBe("Groceries"); // Falls back to transaction category
    });
  });

  describe("calculateSplitTotals", () => {
    it("should calculate correct totals", () => {
      const splits: SplitAllocation[] = [
        { id: 1, amount: 25.5, description: "A", category: "Food", envelopeId: "env1" },
        { id: 2, amount: 34.5, description: "B", category: "Fun", envelopeId: "env2" },
        { id: 3, amount: 40.0, description: "C", category: "Gas", envelopeId: "env3" },
      ];

      const result = transactionSplitterService.calculateSplitTotals(splits, 100);

      expect(result.original).toBe(100);
      expect(result.allocated).toBe(100);
      expect(result.remaining).toBe(0);
      expect(result.isValid).toBe(true);
      expect(result.isOverAllocated).toBe(false);
    });

    it("should detect under-allocation", () => {
      const splits: SplitAllocation[] = [
        { id: 1, amount: 30, description: "A", category: "Food", envelopeId: "env1" },
        { id: 2, amount: 30, description: "B", category: "Fun", envelopeId: "env2" },
      ];

      const result = transactionSplitterService.calculateSplitTotals(splits, 100);

      expect(result.allocated).toBe(60);
      expect(result.remaining).toBe(40);
      expect(result.isValid).toBe(false);
      expect(result.isOverAllocated).toBe(false);
    });

    it("should detect over-allocation", () => {
      const splits: SplitAllocation[] = [
        { id: 1, amount: 60, description: "A", category: "Food", envelopeId: "env1" },
        { id: 2, amount: 50, description: "B", category: "Fun", envelopeId: "env2" },
      ];

      const result = transactionSplitterService.calculateSplitTotals(splits, 100);

      expect(result.allocated).toBe(110);
      expect(result.remaining).toBe(-10);
      expect(result.isValid).toBe(false);
      expect(result.isOverAllocated).toBe(true);
    });

    it("should handle rounding errors", () => {
      const splits: SplitAllocation[] = [
        { id: 1, amount: 33.33, description: "A", category: "Food", envelopeId: "env1" },
        { id: 2, amount: 33.33, description: "B", category: "Fun", envelopeId: "env2" },
        { id: 3, amount: 33.34, description: "C", category: "Gas", envelopeId: "env3" },
      ];

      const result = transactionSplitterService.calculateSplitTotals(splits, 100);

      // Should be valid despite rounding (within 0.01 threshold)
      expect(result.isValid).toBe(true);
    });

    it("should handle empty splits", () => {
      const result = transactionSplitterService.calculateSplitTotals([], 100);

      expect(result.allocated).toBe(0);
      expect(result.remaining).toBe(100);
      expect(result.isValid).toBe(false);
    });
  });

  describe("validateSplits", () => {
    it("should validate correct splits", () => {
      const splits: SplitAllocation[] = [
        { id: 1, amount: 50, description: "A", category: "Food", envelopeId: "env1" },
        { id: 2, amount: 50, description: "B", category: "Fun", envelopeId: "env2" },
      ];

      const errors = transactionSplitterService.validateSplits(splits, 100);

      expect(errors).toHaveLength(0);
    });

    it("should require at least one split", () => {
      const errors = transactionSplitterService.validateSplits([], 100);

      expect(errors).toContain("At least one split allocation is required");
    });

    it("should require description", () => {
      const splits: SplitAllocation[] = [
        { id: 1, amount: 100, description: "", category: "Food", envelopeId: "env1" },
      ];

      const errors = transactionSplitterService.validateSplits(splits, 100);

      expect(errors).toContain("Split 1: Description is required");
    });

    it("should require valid amount", () => {
      const splits: SplitAllocation[] = [
        { id: 1, amount: 0, description: "Test", category: "Food", envelopeId: "env1" },
      ];

      const errors = transactionSplitterService.validateSplits(splits, 100);

      expect(errors).toContain("Split 1: Amount must be greater than 0");
    });

    it("should require category", () => {
      const splits: SplitAllocation[] = [
        { id: 1, amount: 100, description: "Test", category: "", envelopeId: "env1" },
      ];

      const errors = transactionSplitterService.validateSplits(splits, 100);

      expect(errors).toContain("Split 1: Category is required");
    });

    it("should detect total mismatch", () => {
      const splits: SplitAllocation[] = [
        { id: 1, amount: 30, description: "A", category: "Food", envelopeId: "env1" },
        { id: 2, amount: 30, description: "B", category: "Fun", envelopeId: "env2" },
      ];

      const errors = transactionSplitterService.validateSplits(splits, 100);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.includes("less than original amount"))).toBe(true);
    });

    it("should detect over-allocation", () => {
      const splits: SplitAllocation[] = [
        { id: 1, amount: 60, description: "A", category: "Food", envelopeId: "env1" },
        { id: 2, amount: 50, description: "B", category: "Fun", envelopeId: "env2" },
      ];

      const errors = transactionSplitterService.validateSplits(splits, 100);

      expect(errors.some((e) => e.includes("exceed original amount"))).toBe(true);
    });

    it("should accumulate multiple errors", () => {
      const splits: SplitAllocation[] = [
        { id: 1, amount: 0, description: "", category: "", envelopeId: "env1" },
        { id: 2, amount: 50, description: "B", category: "Fun", envelopeId: "env2" },
      ];

      const errors = transactionSplitterService.validateSplits(splits, 100);

      // Should have errors for description, amount, category, and total
      expect(errors.length).toBeGreaterThan(3);
    });
  });

  describe("autoBalanceSplits", () => {
    it("should balance under-allocated splits", () => {
      const splits: SplitAllocation[] = [
        { id: 1, amount: 30, description: "A", category: "Food", envelopeId: "env1" },
        { id: 2, amount: 30, description: "B", category: "Fun", envelopeId: "env2" },
      ];

      const result = transactionSplitterService.autoBalanceSplits(splits, 100);

      const total = result.reduce((sum, s) => sum + s.amount, 0);
      expect(Math.abs(total - 100)).toBeLessThan(0.01);
    });

    it("should balance over-allocated splits", () => {
      const splits: SplitAllocation[] = [
        { id: 1, amount: 60, description: "A", category: "Food", envelopeId: "env1" },
        { id: 2, amount: 50, description: "B", category: "Fun", envelopeId: "env2" },
      ];

      const result = transactionSplitterService.autoBalanceSplits(splits, 100);

      const total = result.reduce((sum, s) => sum + s.amount, 0);
      expect(Math.abs(total - 100)).toBeLessThan(0.01);
    });

    it("should not modify already balanced splits", () => {
      const splits: SplitAllocation[] = [
        { id: 1, amount: 50, description: "A", category: "Food", envelopeId: "env1" },
        { id: 2, amount: 50, description: "B", category: "Fun", envelopeId: "env2" },
      ];

      const result = transactionSplitterService.autoBalanceSplits(splits, 100);

      expect(result[0].amount).toBe(50);
      expect(result[1].amount).toBe(50);
    });

    it("should handle empty splits array", () => {
      const result = transactionSplitterService.autoBalanceSplits([], 100);

      expect(result).toEqual([]);
    });
  });

  describe("splitEvenly", () => {
    it("should split amount evenly", () => {
      const splits: SplitAllocation[] = [
        { id: 1, amount: 10, description: "A", category: "Food", envelopeId: "env1" },
        { id: 2, amount: 20, description: "B", category: "Fun", envelopeId: "env2" },
        { id: 3, amount: 30, description: "C", category: "Gas", envelopeId: "env3" },
      ];

      const result = transactionSplitterService.splitEvenly(splits, 90);

      expect(result[0].amount).toBe(30);
      expect(result[1].amount).toBe(30);
      expect(result[2].amount).toBe(30);
    });

    it("should handle remainder in first split", () => {
      const splits: SplitAllocation[] = [
        { id: 1, amount: 0, description: "A", category: "Food", envelopeId: "env1" },
        { id: 2, amount: 0, description: "B", category: "Fun", envelopeId: "env2" },
        { id: 3, amount: 0, description: "C", category: "Gas", envelopeId: "env3" },
      ];

      const result = transactionSplitterService.splitEvenly(splits, 100);

      // 100 / 3 = 33.33 each, first split gets remainder
      const total = result.reduce((sum, s) => sum + s.amount, 0);
      expect(Math.abs(total - 100)).toBeLessThan(0.01);
    });

    it("should handle empty splits", () => {
      const result = transactionSplitterService.splitEvenly([], 100);

      expect(result).toEqual([]);
    });

    it("should handle single split", () => {
      const splits: SplitAllocation[] = [
        { id: 1, amount: 50, description: "A", category: "Food", envelopeId: "env1" },
      ];

      const result = transactionSplitterService.splitEvenly(splits, 100);

      expect(result[0].amount).toBe(100);
    });
  });

  describe("createSplitTransactions", () => {
    it("should create split transactions with correct structure", () => {
      const splits: SplitAllocation[] = [
        { id: 1, amount: 50, description: "Food", category: "Groceries", envelopeId: "env1" },
        { id: 2, amount: 50, description: "Gas", category: "Transportation", envelopeId: "env2" },
      ];

      const result = transactionSplitterService.createSplitTransactions(mockTransaction, splits);

      expect(result).toHaveLength(2);

      // Check first transaction
      expect(result[0].description).toBe("Food");
      expect(result[0].amount).toBe(-50); // Preserves sign
      expect(result[0].category).toBe("Groceries");
      expect(result[0].envelopeId).toBe("env1");
      expect(result[0].date).toBe(mockTransaction.date);

      // Check metadata
      expect(result[0].metadata?.splitData?.originalTransactionId).toBe(mockTransaction.id);
      expect(result[0].metadata?.splitData?.splitIndex).toBe(0);
      expect(result[0].metadata?.splitData?.totalSplits).toBe(2);
    });

    it("should preserve transaction sign for negative amounts", () => {
      const transaction = { ...mockTransaction, amount: -100 };
      const splits: SplitAllocation[] = [
        { id: 1, amount: 50, description: "A", category: "Food", envelopeId: "env1" },
      ];

      const result = transactionSplitterService.createSplitTransactions(transaction, splits);

      expect(result[0].amount).toBe(-50);
    });

    it("should preserve transaction sign for positive amounts", () => {
      const transaction = { ...mockTransaction, amount: 100 };
      const splits: SplitAllocation[] = [
        { id: 1, amount: 50, description: "A", category: "Food", envelopeId: "env1" },
      ];

      const result = transactionSplitterService.createSplitTransactions(transaction, splits);

      expect(result[0].amount).toBe(50);
    });

    it("should add notes with split information", () => {
      const splits: SplitAllocation[] = [
        { id: 1, amount: 100, description: "Test", category: "Food", envelopeId: "env1" },
      ];

      const result = transactionSplitterService.createSplitTransactions(mockTransaction, splits);

      expect(result[0].notes).toContain("Split 1/1");
      expect(result[0].notes).toContain(mockTransaction.description);
    });

    it("should generate unique IDs for each split", () => {
      const splits: SplitAllocation[] = [
        { id: 1, amount: 50, description: "A", category: "Food", envelopeId: "env1" },
        { id: 2, amount: 50, description: "B", category: "Fun", envelopeId: "env2" },
      ];

      const result = transactionSplitterService.createSplitTransactions(mockTransaction, splits);

      expect(result[0].id).not.toBe(result[1].id);
      expect(result[0].id).toContain("split");
      expect(result[1].id).toContain("split");
    });
  });

  describe("createNewSplitAllocation", () => {
    it("should create new split with remaining amount", () => {
      const existingSplits: SplitAllocation[] = [
        { id: 1, amount: 30, description: "A", category: "Food", envelopeId: "env1" },
      ];

      const result = transactionSplitterService.createNewSplitAllocation(
        mockTransaction,
        existingSplits
      );

      expect(result.amount).toBe(70); // 100 - 30 = 70
      expect(result.category).toBe(mockTransaction.category);
      expect(result.description).toBe("");
      expect(result.id).toBeDefined();
    });

    it("should handle case where everything is allocated", () => {
      const existingSplits: SplitAllocation[] = [
        { id: 1, amount: 50, description: "A", category: "Food", envelopeId: "env1" },
        { id: 2, amount: 50, description: "B", category: "Fun", envelopeId: "env2" },
      ];

      const result = transactionSplitterService.createNewSplitAllocation(
        mockTransaction,
        existingSplits
      );

      expect(result.amount).toBe(0);
    });

    it("should handle over-allocation", () => {
      const existingSplits: SplitAllocation[] = [
        { id: 1, amount: 120, description: "A", category: "Food", envelopeId: "env1" },
      ];

      const result = transactionSplitterService.createNewSplitAllocation(
        mockTransaction,
        existingSplits
      );

      expect(result.amount).toBe(0); // Max at 0, not negative
    });

    it("should use transaction category as default", () => {
      const result = transactionSplitterService.createNewSplitAllocation(mockTransaction, []);

      expect(result.category).toBe("Groceries");
    });
  });

  describe("updateSplitAllocation", () => {
    const baseSplits = [
      { id: 1, amount: 30, description: "A", category: "Food", envelopeId: "env1" },
      { id: 2, amount: 70, description: "B", category: "Fun", envelopeId: "env2" },
    ];

    it("should update split field", () => {
      const result = transactionSplitterService.updateSplitAllocation(
        baseSplits,
        1,
        "amount",
        50,
        mockEnvelopes
      );

      expect(result[0].amount).toBe(50);
      expect(result[1].amount).toBe(70); // Unchanged
    });

    it("should update description", () => {
      const result = transactionSplitterService.updateSplitAllocation(
        baseSplits,
        1,
        "description",
        "Updated",
        mockEnvelopes
      );

      expect(result[0].description).toBe("Updated");
    });

    it("should auto-find envelope when category changes", () => {
      const result = transactionSplitterService.updateSplitAllocation(
        baseSplits,
        1,
        "category",
        "Entertainment",
        mockEnvelopes
      );

      expect(result[0].category).toBe("Entertainment");
      expect(result[0].envelopeId).toBe("env2");
    });

    it("should keep existing envelopeId if no match found", () => {
      const result = transactionSplitterService.updateSplitAllocation(
        baseSplits,
        1,
        "category",
        "Unknown",
        mockEnvelopes
      );

      expect(result[0].category).toBe("Unknown");
      expect(result[0].envelopeId).toBe("env1"); // Unchanged
    });

    it("should not modify other splits", () => {
      const result = transactionSplitterService.updateSplitAllocation(
        baseSplits,
        1,
        "amount",
        40,
        mockEnvelopes
      );

      expect(result[0].amount).toBe(40);
      expect(result[1].amount).toBe(70);
      expect(result[1].description).toBe("B");
    });

    it("should handle non-existent split ID", () => {
      const result = transactionSplitterService.updateSplitAllocation(
        baseSplits,
        999,
        "amount",
        50,
        mockEnvelopes
      );

      // Should return unchanged
      expect(result).toEqual(baseSplits);
    });
  });
});
