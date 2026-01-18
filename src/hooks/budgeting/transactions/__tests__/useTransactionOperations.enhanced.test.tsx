import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTransactionOperations } from "../useTransactionOperations";
import { budgetDb } from "@/db/budgetDb";
import { useTransactionBalanceUpdater } from "../useTransactionBalanceUpdater";
import type { Transaction } from "@/db/types";

// Mock dependencies
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as Record<string, unknown>),
    useMutation: vi.fn(),
    useQueryClient: vi.fn(),
  };
});

vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    envelopes: {
      get: vi.fn(),
    },
    transactions: {
      put: vi.fn(),
      update: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
    },
    addTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    putTransaction: vi.fn(),
  },
}));

vi.mock("@/utils/core/common/queryClient", () => ({
  queryKeys: {
    transactions: ["transactions"],
    envelopes: ["envelopes"],
    dashboard: ["dashboard"],
  },
  optimisticHelpers: {
    addTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    removeTransaction: vi.fn(),
  },
}));

vi.mock("../useTransactionBalanceUpdater", () => ({
  useTransactionBalanceUpdater: vi.fn(),
}));

vi.mock("@/domain/schemas/transaction", () => ({
  normalizeTransactionAmount: vi.fn((txn) => txn),
  validateAndNormalizeTransaction: vi.fn((txn) => txn),
  validateTransactionPartialSafe: vi.fn((data) => ({ success: true, data })),
}));

// Mock window.cloudSyncService
const mockTriggerSync = vi.fn();
Object.defineProperty(window, "cloudSyncService", {
  value: {
    triggerSyncForCriticalChange: mockTriggerSync,
  },
  writable: true,
});

describe("useTransactionOperations - Enhanced", () => {
  const mockQueryClient = {
    invalidateQueries: vi.fn(),
  };

  const mockUpdateBalances = vi.fn().mockResolvedValue(undefined);

  beforeEach(async () => {
    vi.clearAllMocks();
    (useQueryClient as Mock).mockReturnValue(mockQueryClient);
    (useTransactionBalanceUpdater as Mock).mockReturnValue({
      updateBalancesForTransaction: mockUpdateBalances,
    });

    // Reset validation mock to succeed by default
    const schemaModule = await import("@/domain/schemas/transaction");
    (schemaModule.validateTransactionPartialSafe as Mock).mockImplementation((data) => ({
      success: true,
      data,
    }));

    // Default implementation for useMutation
    (useMutation as Mock).mockImplementation((options) => ({
      mutate: (data: unknown) => options.mutationFn(data).then(options.onSuccess),
      mutateAsync: (data: unknown) =>
        options.mutationFn(data).then((res: unknown) => {
          if (options.onSuccess) options.onSuccess(res);
          return res;
        }),
      isPending: false,
      error: null,
    }));
  });

  describe("addTransaction", () => {
    it("should add a transaction successfully", async () => {
      (budgetDb.envelopes.get as Mock).mockResolvedValue({
        id: "env1",
        category: "Groceries",
      });
      (budgetDb.putTransaction as Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionOperations());

      const data = {
        amount: 100,
        envelopeId: "env1",
        type: "expense" as const,
        description: "Test transaction",
      };

      await act(async () => {
        await result.current.addTransaction(data);
      });

      expect(budgetDb.putTransaction).toHaveBeenCalled();
      expect(mockUpdateBalances).toHaveBeenCalled();
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["transactions"],
      });
      expect(mockTriggerSync).toHaveBeenCalledWith("transaction_added");
    });

    it("should throw error if envelope not found", async () => {
      (budgetDb.envelopes.get as Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useTransactionOperations());

      const data = {
        amount: 100,
        envelopeId: "nonexistent",
      };

      await act(async () => {
        await expect(result.current.addTransaction(data)).rejects.toThrow("Envelope not found");
      });
    });

    it("should use defaults for missing fields", async () => {
      (budgetDb.envelopes.get as Mock).mockResolvedValue({
        id: "env1",
        category: "Food",
      });
      (budgetDb.putTransaction as Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionOperations());

      const data = {
        envelopeId: "env1",
      };

      await act(async () => {
        await result.current.addTransaction(data);
      });

      expect(budgetDb.putTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "expense",
          amount: 0,
        })
      );
    });

    it("should use envelope category if not provided", async () => {
      (budgetDb.envelopes.get as Mock).mockResolvedValue({
        id: "env1",
        category: "Transportation",
      });
      (budgetDb.putTransaction as Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionOperations());

      const data = {
        envelopeId: "env1",
        amount: 50,
      };

      await act(async () => {
        await result.current.addTransaction(data);
      });

      expect(budgetDb.putTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          category: "Transportation",
        })
      );
    });

    it("should convert date to Date object", async () => {
      (budgetDb.envelopes.get as Mock).mockResolvedValue({ id: "env1", category: "Test" });
      (budgetDb.putTransaction as Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionOperations());

      const data = {
        envelopeId: "env1",
        amount: 100,
        date: "2023-01-15",
      };

      await act(async () => {
        await result.current.addTransaction(data);
      });

      expect(budgetDb.putTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          date: expect.any(Date),
        })
      );
    });

    it("should invalidate both transactions and envelopes", async () => {
      (budgetDb.envelopes.get as Mock).mockResolvedValue({ id: "env1", category: "Test" });
      (budgetDb.putTransaction as Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionOperations());

      await act(async () => {
        await result.current.addTransaction({ envelopeId: "env1", amount: 100 });
      });

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["transactions"],
      });
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["envelopes"],
      });
    });
  });

  describe("updateTransaction", () => {
    it("should update a transaction", async () => {
      (budgetDb.updateTransaction as Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionOperations());

      const updates = {
        description: "Updated description",
        amount: 150,
      };

      await act(async () => {
        await result.current.updateTransaction("txn1", updates);
      });

      expect(budgetDb.updateTransaction).toHaveBeenCalledWith(
        "txn1",
        expect.objectContaining({
          description: "Updated description",
          amount: 150,
          lastModified: expect.any(Number),
        })
      );
      expect(mockTriggerSync).toHaveBeenCalledWith("transaction_updated");
    });

    it("should convert date string to Date object", async () => {
      (budgetDb.updateTransaction as Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionOperations());

      const updates = {
        date: "2023-02-15",
      };

      await act(async () => {
        await result.current.updateTransaction("txn1", updates);
      });

      expect(budgetDb.updateTransaction).toHaveBeenCalledWith(
        "txn1",
        expect.objectContaining({
          date: expect.any(Date),
        })
      );
    });

    it("should handle partial updates", async () => {
      (budgetDb.updateTransaction as Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionOperations());

      const updates = {
        notes: "Just adding notes",
      };

      await act(async () => {
        await result.current.updateTransaction("txn1", updates);
      });

      expect(budgetDb.updateTransaction).toHaveBeenCalledWith(
        "txn1",
        expect.objectContaining({
          notes: "Just adding notes",
        })
      );
    });

    it("should throw error on invalid data", async () => {
      const { validateTransactionPartialSafe } = await import("@/domain/schemas/transaction");
      (validateTransactionPartialSafe as Mock).mockReturnValue({ success: false });

      const { result } = renderHook(() => useTransactionOperations());

      await act(async () => {
        await expect(result.current.updateTransaction("txn1", {})).rejects.toThrow("Invalid data");
      });
    });
  });

  describe("deleteTransaction", () => {
    it("should delete a transaction and update balances", async () => {
      const mockTransaction: Transaction = {
        id: "txn1",
        amount: 100,
        envelopeId: "env1",
        type: "expense",
        category: "Test",
        date: new Date(),
        createdAt: Date.now(),
        lastModified: Date.now(),
        isScheduled: false,
      };

      (budgetDb.transactions.get as Mock).mockResolvedValue(mockTransaction);
      (budgetDb.transactions.delete as Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionOperations());

      await act(async () => {
        await result.current.deleteTransaction("txn1");
      });

      expect(budgetDb.transactions.delete).toHaveBeenCalledWith("txn1");
      expect(mockUpdateBalances).toHaveBeenCalledWith(mockTransaction, true);
      expect(mockTriggerSync).toHaveBeenCalledWith("transaction_deleted");
    });

    it("should handle deletion of non-existent transaction", async () => {
      (budgetDb.transactions.get as Mock).mockResolvedValue(null);
      (budgetDb.transactions.delete as Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionOperations());

      await act(async () => {
        await result.current.deleteTransaction("nonexistent");
      });

      expect(budgetDb.transactions.delete).toHaveBeenCalledWith("nonexistent");
      expect(mockUpdateBalances).not.toHaveBeenCalled();
    });
  });

  describe("splitTransaction", () => {
    it("should split a transaction into multiple parts", async () => {
      const originalTransaction: Transaction = {
        id: "original",
        date: new Date("2023-01-15"),
        amount: 150,
        envelopeId: "env1",
        category: "Shopping",
        type: "expense",
        isScheduled: false,
        createdAt: Date.now(),
        lastModified: Date.now(),
      };

      (budgetDb.transactions.get as Mock).mockResolvedValue(originalTransaction);
      (budgetDb.transactions.delete as Mock).mockResolvedValue(undefined);
      (budgetDb.putTransaction as Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionOperations());

      const splits = [
        { amount: 75, envelopeId: "env1" },
        { amount: 75, envelopeId: "env2" },
      ];

      await act(async () => {
        await result.current.splitTransaction("original", splits);
      });

      expect(budgetDb.transactions.delete).toHaveBeenCalledWith("original");
      expect(mockUpdateBalances).toHaveBeenCalledWith(originalTransaction, true);
      expect(budgetDb.putTransaction).toHaveBeenCalledTimes(2);
      expect(mockTriggerSync).toHaveBeenCalledWith("transaction_split");
    });

    it("should throw error if original not found", async () => {
      (budgetDb.transactions.get as Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useTransactionOperations());

      const splits = [{ amount: 50 }, { amount: 50 }];

      await act(async () => {
        await expect(result.current.splitTransaction("nonexistent", splits)).rejects.toThrow(
          "Not found"
        );
      });
    });

    it("should preserve original date and type in splits", async () => {
      const originalTransaction: Transaction = {
        id: "original",
        date: new Date("2023-02-20"),
        amount: 100,
        envelopeId: "env1",
        category: "Food",
        type: "expense",
        isScheduled: false,
        createdAt: Date.now(),
        lastModified: Date.now(),
      };

      (budgetDb.transactions.get as Mock).mockResolvedValue(originalTransaction);
      (budgetDb.transactions.delete as Mock).mockResolvedValue(undefined);
      (budgetDb.putTransaction as Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionOperations());

      const splits = [{ amount: 50 }, { amount: 50 }];

      await act(async () => {
        await result.current.splitTransaction("original", splits);
      });

      expect(budgetDb.putTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          date: originalTransaction.date,
          type: "expense",
        })
      );
    });

    it("should allow custom category per split", async () => {
      const originalTransaction: Transaction = {
        id: "original",
        date: new Date(),
        amount: 100,
        envelopeId: "env1",
        category: "Mixed",
        type: "expense",
        isScheduled: false,
        createdAt: Date.now(),
        lastModified: Date.now(),
      };

      (budgetDb.transactions.get as Mock).mockResolvedValue(originalTransaction);
      (budgetDb.transactions.delete as Mock).mockResolvedValue(undefined);
      (budgetDb.putTransaction as Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionOperations());

      const splits = [
        { amount: 60, category: "Food" },
        { amount: 40, category: "Gas" },
      ];

      await act(async () => {
        await result.current.splitTransaction("original", splits);
      });

      expect(budgetDb.putTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          category: "Food",
        })
      );
      expect(budgetDb.putTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          category: "Gas",
        })
      );
    });
  });

  describe("bulkOperation", () => {
    it("should delete multiple transactions", async () => {
      const transactions: Transaction[] = [
        {
          id: "txn1",
          amount: 50,
          envelopeId: "env1",
          type: "expense",
          category: "Test",
          date: new Date(),
          createdAt: Date.now(),
          lastModified: Date.now(),
          isScheduled: false,
        },
        {
          id: "txn2",
          amount: 75,
          envelopeId: "env1",
          type: "expense",
          category: "Test",
          date: new Date(),
          createdAt: Date.now(),
          lastModified: Date.now(),
          isScheduled: false,
        },
      ];

      (budgetDb.transactions.get as Mock).mockImplementation((id: string) => {
        return Promise.resolve(transactions.find((t) => t.id === id));
      });
      (budgetDb.transactions.delete as Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionOperations());

      await act(async () => {
        await result.current.bulkOperation("delete", transactions);
      });

      expect(budgetDb.transactions.delete).toHaveBeenCalledTimes(2);
      expect(mockTriggerSync).toHaveBeenCalledWith("transaction_bulk");
    });

    it("should update multiple transactions", async () => {
      const transactions: Transaction[] = [
        {
          id: "txn1",
          amount: 50,
          envelopeId: "env1",
          type: "expense",
          category: "Test",
          date: new Date(),
          createdAt: Date.now(),
          lastModified: Date.now(),
          isScheduled: false,
        },
        {
          id: "txn2",
          amount: 75,
          envelopeId: "env1",
          type: "expense",
          category: "Test",
          date: new Date(),
          createdAt: Date.now(),
          lastModified: Date.now(),
          isScheduled: false,
        },
      ];

      (budgetDb.updateTransaction as Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionOperations());

      const updates = { category: "Updated Category" };

      await act(async () => {
        await result.current.bulkOperation("update", transactions, updates);
      });

      expect(budgetDb.updateTransaction).toHaveBeenCalledTimes(2);
    });

    it("should classify multiple transactions", async () => {
      const transactions: Transaction[] = [
        {
          id: "txn1",
          amount: 50,
          envelopeId: "env1",
          type: "expense",
          category: "Uncategorized",
          date: new Date(),
          createdAt: Date.now(),
          lastModified: Date.now(),
          isScheduled: false,
        },
      ];

      (budgetDb.updateTransaction as Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionOperations());

      const updates = { category: "Groceries" };

      await act(async () => {
        await result.current.bulkOperation("classify", transactions, updates);
      });

      expect(budgetDb.updateTransaction).toHaveBeenCalledWith(
        "txn1",
        expect.objectContaining({
          category: "Groceries",
        })
      );
    });

    it("should throw error if updates missing for update operation", async () => {
      const transactions: Transaction[] = [
        {
          id: "txn1",
          amount: 50,
          envelopeId: "env1",
          type: "expense",
          category: "Test",
          date: new Date(),
          createdAt: Date.now(),
          lastModified: Date.now(),
          isScheduled: false,
        },
      ];

      const { result } = renderHook(() => useTransactionOperations());

      await act(async () => {
        await expect(result.current.bulkOperation("update", transactions)).rejects.toThrow(
          "Updates required"
        );
      });
    });
  });

  describe("Processing State", () => {
    it("should indicate processing state", () => {
      (useMutation as Mock).mockImplementation((options) => ({
        mutate: (data: unknown) => options.mutationFn(data).then(options.onSuccess),
        mutateAsync: (data: unknown) => options.mutationFn(data).then(options.onSuccess),
        isPending: true,
        error: null,
      }));

      const { result } = renderHook(() => useTransactionOperations());

      expect(result.current.isProcessing).toBe(true);
    });

    it("should provide error state", () => {
      const testError = new Error("Test error");

      (useMutation as Mock).mockImplementation((options) => ({
        mutate: (data: unknown) => options.mutationFn(data).then(options.onSuccess),
        mutateAsync: (data: unknown) => options.mutationFn(data).then(options.onSuccess),
        isPending: false,
        error: testError,
      }));

      const { result } = renderHook(() => useTransactionOperations());

      expect(result.current.error).toBe(testError);
    });
  });

  describe("Cloud Sync Integration", () => {
    it("should trigger sync for add operation", async () => {
      (budgetDb.envelopes.get as Mock).mockResolvedValue({ id: "env1", category: "Test" });
      (budgetDb.putTransaction as Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionOperations());

      await act(async () => {
        await result.current.addTransaction({ envelopeId: "env1", amount: 100 });
      });

      expect(mockTriggerSync).toHaveBeenCalledWith("transaction_added");
    });

    it("should trigger sync for update operation", async () => {
      (budgetDb.updateTransaction as Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionOperations());

      await act(async () => {
        await result.current.updateTransaction("txn1", { description: "Updated" });
      });

      expect(mockTriggerSync).toHaveBeenCalledWith("transaction_updated");
    });

    it("should trigger sync for delete operation", async () => {
      (budgetDb.transactions.get as Mock).mockResolvedValue({ id: "txn1" });
      (budgetDb.transactions.delete as Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionOperations());

      await act(async () => {
        await result.current.deleteTransaction("txn1");
      });

      expect(mockTriggerSync).toHaveBeenCalledWith("transaction_deleted");
    });

    it("should handle missing cloudSyncService gracefully", async () => {
      // Save original value
      const originalSync = (window as { cloudSyncService?: unknown }).cloudSyncService;

      // Set to undefined
      Object.defineProperty(window, "cloudSyncService", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      (budgetDb.envelopes.get as Mock).mockResolvedValue({ id: "env1", category: "Test" });
      (budgetDb.putTransaction as Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionOperations());

      await act(async () => {
        await result.current.addTransaction({ envelopeId: "env1", amount: 100 });
      });

      // Should not throw error
      expect(budgetDb.putTransaction).toHaveBeenCalled();

      // Restore original value
      Object.defineProperty(window, "cloudSyncService", {
        value: originalSync,
        writable: true,
        configurable: true,
      });
    });
  });
});
